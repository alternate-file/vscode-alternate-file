import * as vscode from "vscode";
import * as FindAlternate from "./FindAlternate";
import * as Projection from "./Projection";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('"vscode-alternate" is now active');

  Projection.findProjections().then(
    projections => {
      const patterns = Projection.projectionsToAlternatePatterns(projections);

      const commands = [
        vscode.commands.registerCommand(
          "alternate.alternateFile",
          FindAlternate.openFile(patterns, { split: false })
        ),
        vscode.commands.registerCommand(
          "alternate.alternateFileInSplit",
          FindAlternate.openFile(patterns, { split: true })
        )
      ];

      commands.forEach(command => context.subscriptions.push(command));
    },
    () => console.log(".projections.json not found")
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
