import * as vscode from "vscode"

import { AgentManagerProvider } from "../agent-manager/AgentManagerProvider"

// zhanlu_change start - extension-side bridge between workbench Agent mode and Agent Manager panel
export class AgentModeController {
  private active = false
  private lastEditorUri: vscode.Uri | undefined
  private lastEditorViewColumn: vscode.ViewColumn | undefined

  constructor(private readonly agentManagerProvider: AgentManagerProvider) {}

  public async initialize(): Promise<void> {
    await this.refreshState()
  }

  public async enterAgentMode(): Promise<void> {
    if (await this.refreshState()) {
      this.agentManagerProvider.openPanel()
      return
    }

    this.captureReturnEditor()
    await vscode.commands.executeCommand("zhanlu.layout.enterAgentMode")
    this.agentManagerProvider.openPanel()

    this.active = true
    await this.updateContexts()
  }

  public async exitAgentMode(): Promise<void> {
    if (!(await this.refreshState())) {
      return
    }

    await vscode.commands.executeCommand("zhanlu.layout.exitAgentMode")
    await this.restoreReturnEditor()

    this.active = false
    await this.updateContexts()
  }

  public async toggleMode(): Promise<void> {
    if (await this.refreshState()) {
      await this.exitAgentMode()
      return
    }

    await this.enterAgentMode()
  }

  private async refreshState(): Promise<boolean> {
    this.active = await this.queryCoreAgentMode()
    await this.updateContexts()
    return this.active
  }

  private async queryCoreAgentMode(): Promise<boolean> {
    try {
      return (await vscode.commands.executeCommand<boolean>("zhanlu.layout.isAgentMode")) === true
    } catch {
      return this.active
    }
  }

  // zhanlu_change start - preserve the Agent Manager webview instance by switching back to a regular editor instead of disposing the panel
  private captureReturnEditor(): void {
    const activeTextEditor = vscode.window.activeTextEditor
    this.lastEditorUri = activeTextEditor?.document.uri
    this.lastEditorViewColumn = activeTextEditor?.viewColumn
  }

  private async restoreReturnEditor(): Promise<void> {
    if (this.lastEditorUri) {
      try {
        const document = await vscode.workspace.openTextDocument(this.lastEditorUri)
        await vscode.window.showTextDocument(document, {
          viewColumn: this.lastEditorViewColumn,
          preserveFocus: false,
          preview: false,
        })
        return
      } catch {
        // Fall through to MRU restore when the previous text editor can no longer be reopened.
      }
    }

    await vscode.commands.executeCommand("workbench.action.openPreviousRecentlyUsedEditor")
  }
  // zhanlu_change end

  private async updateContexts(): Promise<void> {
    await vscode.commands.executeCommand("setContext", "zhanlu.agent.active", this.active)
    await vscode.commands.executeCommand("setContext", "zhanlu.agent.commandsReady", true)
  }
}
// zhanlu_change end
