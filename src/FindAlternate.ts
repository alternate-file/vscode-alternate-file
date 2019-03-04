import * as vscode from "vscode";

import * as Projection from "./engine/Projections";
import * as Result from "./result/Result";
import * as FilePath from "./FilePane";

export interface Options {
  split: boolean;
}

export const openFile = ({ split }: Options) => async (): Promise<void> => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return;
  const currentPath = getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = nextViewColumn(split, activeEditor);

  Result.either(
    await Projection.findAlternateFile(currentPath),
    newPath => FilePath.open(viewColumn, newPath),
    error => vscode.window.showErrorMessage(error.message)
  );
};

export const createFile = ({ split }: Options) => async (): Promise<void> => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return;
  const currentPath = getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = nextViewColumn(split, activeEditor);

  Result.either(
    await Projection.findOrCreateAlternateFile(currentPath),
    newPath => FilePath.open(viewColumn, newPath),
    error => vscode.window.showErrorMessage(error.message)
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
  const path = activeEditor.document.uri.path;
  // const path = vscode.workspace.asRelativePath(activeEditor.document.uri);
  return path ? path.replace(/\\/g, "/") : null;
};
