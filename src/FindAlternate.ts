import * as vscode from "vscode";

import * as Projection from "./engine/Projection";
import * as Result from "./result/Result";
import * as FilePath from "./FilePath";

export interface Options {
  split: boolean;
}

export const openFile = ({ split }: Options) => async (): Promise<void> => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return;
  const currentPath = getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = nextViewColumn(split, activeEditor);

  const pathResponse = await Projection.findAlternateFile(currentPath);

  Result.either(
    newPath => FilePath.open(viewColumn, newPath),
    possiblePaths =>
      vscode.window.showErrorMessage(
        `Couldn't find an alternate file for ${currentPath}. Tried: ${possiblePaths}`
      ),
    pathResponse
  );
};

export const createFile = ({ split }: Options) => async (): Promise<void> => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return;
  const currentPath = getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = nextViewColumn(split, activeEditor);

  const pathResponse = await Projection.findOrCreateAlternateFile(currentPath);

  Result.either(
    newPath => FilePath.open(viewColumn, newPath),
    (errorMessage): void => {
      vscode.window.showErrorMessage(errorMessage);
    },
    pathResponse
  );
};

const getActiveEditor = (): vscode.TextEditor | null =>
  vscode.window.activeTextEditor || null;

const getCurrentPath = (activeEditor: vscode.TextEditor): string | null =>
  relativePath(activeEditor);

const nextViewColumn = (
  split: boolean,
  activeEditor: vscode.TextEditor
): number => {
  if (!activeEditor.viewColumn) return 0;
  if (!split) return -1;
  return activeEditor.viewColumn + 1;
};

const relativePath = (activeEditor: vscode.TextEditor) => {
  const path = vscode.workspace.asRelativePath(activeEditor.document.uri);
  return path ? path.replace(/\\/g, "/") : null;
};
