import * as vscode from "vscode";
import * as FindAlternate from "./FindAlternate";
import * as Projection from "./Projection";

const errorMessagePrefix = "Failed to parse .projections.json";

let commands: vscode.Disposable[] = [];

export const activate = async (
  context: vscode.ExtensionContext
): Promise<void> => {
  const registerCommandsWithContext = registerCommands(context);

  commands = await registerCommandsWithContext();
  const projectionsWatcher = vscode.workspace.createFileSystemWatcher(
    "**/.projections.json"
  );

  projectionsWatcher.onDidChange(registerCommandsWithContext);
  projectionsWatcher.onDidCreate(registerCommandsWithContext);
  projectionsWatcher.onDidDelete(deregisterCommands);
};

const deregisterCommands = () => {
  commands.forEach(command => command.dispose());
};

const registerCommands = (context: vscode.ExtensionContext) => async () => {
  deregisterCommands();

  try {
    const projections = await Projection.findProjections();
    const patterns = Projection.projectionsToAlternatePatterns(projections);

    commands = [
      vscode.commands.registerCommand(
        "alternate.alternateFile",
        FindAlternate.openFile(patterns, { split: false })
      ),
      vscode.commands.registerCommand(
        "alternate.alternateFileInSplit",
        FindAlternate.openFile(patterns, { split: true })
      ),
      vscode.commands.registerCommand(
        "alternate.createAlternateFile",
        FindAlternate.createFile(patterns, { split: false })
      ),
      vscode.commands.registerCommand(
        "alternate.createAlternateFileInSplit",
        FindAlternate.createFile(patterns, { split: true })
      )
    ];

    commands.forEach(command => context.subscriptions.push(command));

    console.log("updated .projections.json");

    return commands;
  } catch (e) {
    const message = e.message
      ? `${errorMessagePrefix}: ${e.message}`
      : errorMessagePrefix;
    vscode.window.showErrorMessage(message);

    return [];
  }
};

export function deactivate() {}
