import * as vscode from "vscode";
import * as FindAlternate from "./FindAlternate";
import { initializeProjectionsHere } from "./InitializeProjections";

let commands: vscode.Disposable[] = [];

export const activate = async (
  context: vscode.ExtensionContext
): Promise<void> => {
  commands = [
    vscode.commands.registerCommand(
      "alternateFile.initProjections",
      initializeProjectionsHere
    ),
    vscode.commands.registerCommand(
      "alternateFile.alternateFile",
      FindAlternate.openFile({ split: false })
    ),
    vscode.commands.registerCommand(
      "alternateFile.alternateFileInSplit",
      FindAlternate.openFile({ split: true })
    ),
    vscode.commands.registerCommand(
      "alternateFile.createAlternateFile",
      FindAlternate.createFile({ split: false })
    ),
    vscode.commands.registerCommand(
      "alternateFile.createAlternateFileInSplit",
      FindAlternate.createFile({ split: true })
    )
  ];

  commands.forEach(command => context.subscriptions.push(command));
};

export function deactivate() {}
