import * as vscode from "vscode"

export class KiloCodeActionProvider implements vscode.CodeActionProvider {
  static readonly metadata: vscode.CodeActionProviderMetadata = {
    providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.RefactorRewrite],
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    if (range.isEmpty) return []

    const actions: vscode.CodeAction[] = []

    const add = new vscode.CodeAction("添加到湛卢", vscode.CodeActionKind.RefactorRewrite)
    add.command = { command: "zhanlu.addToContext", title: "添加到湛卢" }
    actions.push(add)

    const hasDiagnostics = context.diagnostics.length > 0

    if (hasDiagnostics) {
      const fix = new vscode.CodeAction("使用湛卢修复", vscode.CodeActionKind.QuickFix)
      fix.command = { command: "zhanlu.fixCode", title: "使用湛卢修复" }
      fix.isPreferred = true
      actions.push(fix)
    }

    if (!hasDiagnostics) {
      const explain = new vscode.CodeAction("使用湛卢解释", vscode.CodeActionKind.RefactorRewrite)
      explain.command = { command: "zhanlu.explainCode", title: "使用湛卢解释" }
      actions.push(explain)

      const improve = new vscode.CodeAction("使用湛卢改进", vscode.CodeActionKind.RefactorRewrite)
      improve.command = { command: "zhanlu.improveCode", title: "使用湛卢改进" }
      actions.push(improve)
    }

    return actions
  }
}
