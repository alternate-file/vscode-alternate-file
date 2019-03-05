import * as vscode from "vscode";

import * as Projection from "./engine/Projections";
import * as Result from "./result/Result";
import * as FilePane from "./FilePane";

export interface Options {
  split: boolean;
}

export const openFile = ({ split }: Options) => async (): Promise<any> => {
  const activeEditor = FilePane.getActiveEditor();
  if (!activeEditor) return;
  const currentPath = FilePane.getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = FilePane.nextViewColumn(split, activeEditor);

  return Result.either(
    await Projection.findAlternateFile(currentPath),
    newPath => FilePane.open(viewColumn, newPath),
    error => {
      vscode.window.showErrorMessage(error.message);
      return error.message;
    }
  );
};

export const createFile = ({ split }: Options) => async (): Promise<any> => {
  const activeEditor = FilePane.getActiveEditor();
  if (!activeEditor) return;
  const currentPath = FilePane.getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = FilePane.nextViewColumn(split, activeEditor);

  return Result.either(
    await Projection.findOrCreateAlternateFile(currentPath),
    newPath => FilePane.open(viewColumn, newPath),
    error => {
      vscode.window.showErrorMessage(error.message);
      return error.message;
    }
  );
};
