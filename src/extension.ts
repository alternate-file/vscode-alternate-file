import * as vscode from "vscode";
import * as FindAlternate from "./FindAlternate";

let commands: vscode.Disposable[] = [];

export const activate = async (
  context: vscode.ExtensionContext
): Promise<void> => {
  commands = [
    vscode.commands.registerCommand(
      "alternate.alternateFile",
      FindAlternate.openFile({ split: false })
    ),
    vscode.commands.registerCommand(
      "alternate.alternateFileInSplit",
      FindAlternate.openFile({ split: true })
    ),
    vscode.commands.registerCommand(
      "alternate.createAlternateFile",
      FindAlternate.createFile({ split: false })
    ),
    vscode.commands.registerCommand(
      "alternate.createAlternateFileInSplit",
      FindAlternate.createFile({ split: true })
    )
  ];

  commands.forEach(command => context.subscriptions.push(command));
};


export function deactivate() {}
