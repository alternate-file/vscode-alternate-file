import * as vscode from "vscode";
import { initializeProjections, possibleFrameworks } from "alternate-file";
import {
  assertOk,
  isError,
  pipeAsync,
  errorSideEffect,
  asyncChainOk
} from "result-async";
import * as FilePane from "./FilePane";

export async function initializeProjectionsHere() {
  const workspace = FilePane.getActiveWorkspace();

  if (isError(workspace)) {
    vscode.window.showErrorMessage(
      "You must open a file to initialize a .projections.json file"
    );
    return;
  }

  const frameworks = await possibleFrameworks();

  const names = assertOk(frameworks).map(([name, value]) => ({
    value,
    label: name
  }));

  const framework = await vscode.window.showQuickPick(names, {
    placeHolder: "Pick a framework"
  });

  if (!framework) return;

  const workspaceRootPath = workspace.ok.uri.fsPath;

  const editor = FilePane.getActiveEditor();
  const nextColumn = FilePane.nextViewColumn(true, editor);

  return pipeAsync(
    initializeProjections(workspaceRootPath, framework.value),
    asyncChainOk(projectionsPath => {
      vscode.window.showInformationMessage(`Created ${projectionsPath}`);
      return FilePane.open(nextColumn, projectionsPath);
    }),
    errorSideEffect(vscode.window.showErrorMessage)
  );
}
