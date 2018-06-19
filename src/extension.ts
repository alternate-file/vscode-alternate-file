import * as vscode from "vscode";
import * as FindAlternate from "./FindAlternate";
import * as Projection from "./Projection";

const errorMessagePrefix = "Failed to parse .projections.json";

let commands: vscode.Disposable[] = [];

const emptyCommandErrorText =
  "Can't run command - please create a .projections.json first.";
const emptyCommandErrorButton = "Create .projections.json";

export const activate = async (
  context: vscode.ExtensionContext
): Promise<void> => {
  // Always listen for .projections.json config events.
  const createProjectionsCommand = vscode.commands.registerCommand(
    "alternate.configureAlternateFile",
    Projection.create
  );
  context.subscriptions.push(createProjectionsCommand);

  // First run, silently.
  commands = await registerCommands(context, { showErrorMessages: false })();

  // Re-run when .projections.json gets updated.
  const projectionsWatcher = vscode.workspace.createFileSystemWatcher(
    "**/.projections.json"
  );

  const registerCommandsWithContext = registerCommands(context);
  projectionsWatcher.onDidChange(registerCommandsWithContext);
  projectionsWatcher.onDidCreate(registerCommandsWithContext);
  projectionsWatcher.onDidDelete(registerEmptyCommands(context));
};

const deregisterCommands = () => {
  commands.forEach(command => command.dispose());
};

const registerCommands = (
  context: vscode.ExtensionContext,
  { showErrorMessages }: { showErrorMessages: boolean } = {
    showErrorMessages: true
  }
) => async () => {
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

    if (showErrorMessages) {
      vscode.window.showInformationMessage("updated .projections.json");
    }

    return commands;
  } catch (e) {
    if (showErrorMessages) {
      const message = e.message
        ? `${errorMessagePrefix}: ${e.message}`
        : errorMessagePrefix;

      vscode.window.showErrorMessage(message);
    }

    registerEmptyCommands(context)();
    return [];
  }
};

const registerEmptyCommands = (context: vscode.ExtensionContext) => () => {
  deregisterCommands();

  console.log("Register Empty Commands");

  commands = [
    vscode.commands.registerCommand(
      "alternate.alternateFile",
      showMissingProjectionsCommandError
    ),
    vscode.commands.registerCommand(
      "alternate.alternateFileInSplit",
      showMissingProjectionsCommandError
    ),
    vscode.commands.registerCommand(
      "alternate.createAlternateFile",
      showMissingProjectionsCommandError
    ),
    vscode.commands.registerCommand(
      "alternate.createAlternateFileInSplit",
      showMissingProjectionsCommandError
    )
  ];

  commands.forEach(command => context.subscriptions.push(command));
};

const showMissingProjectionsCommandError = async () => {
  const pickedMessage = await vscode.window.showErrorMessage(
    emptyCommandErrorText,
    emptyCommandErrorButton
  );

  if (pickedMessage !== emptyCommandErrorButton) {
    return Promise.resolve();
  }

  try {
    Projection.create();
  } catch (e) {
    vscode.window.showErrorMessage(
      "Can't create .projections.json if no workspace is open"
    );
  }
};

export function deactivate() {}
