import * as vscode from "vscode";
import { initializeProjections, possibleFrameworks } from "alternate-file";
import { okOrThrow, isError, errorDo, okChainAsync } from "result-async";
import { pipeA } from "pipeout";
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

  const names = okOrThrow(frameworks).map(([name, value]) => ({
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

  // prettier-ignore
  return pipeA
    (initializeProjections(workspaceRootPath, framework.value))
    (okChainAsync(projectionsPath => {
      vscode.window.showInformationMessage(`Created ${projectionsPath}`);
      return FilePane.open(nextColumn, projectionsPath);
    }))
    (errorDo(vscode.window.showErrorMessage))
    .value
}
