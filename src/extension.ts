import * as vscode from "vscode";
import * as FindAlternate from "./FindAlternate";
import { patterns } from "./patterns";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('"vscode-switch-to-spec" is now active');

  const commands = [
    vscode.commands.registerCommand(
      "switch-to-spec.alternateFile",
      FindAlternate.openFile(patterns, { split: false })
    ),
    vscode.commands.registerCommand(
      "switch-to-spec.alternateFileInSplit",
      FindAlternate.openFile(patterns, { split: true })
    )
  ];

  commands.forEach(command => context.subscriptions.push(command));
}

// this method is called when your extension is deactivated
export function deactivate() {}
