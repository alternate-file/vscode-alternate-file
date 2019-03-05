import * as vscode from "vscode";

import * as Projection from "./engine/Projections";
import * as Result from "./result/Result";
import * as FilePane from "./FilePane";
import * as AlternateFileNotFoundError from "./engine/AlternateFileNotFoundError";
import { pipeAsync } from "./result/asyncPipe";

export interface Options {
  split: boolean;
}

export const openFile = ({ split }: Options) => async (): Result.P<
  string,
  string
> => {
  const activeEditor = FilePane.getActiveEditor();
  if (!activeEditor) return Result.error("no active editor");
  const currentPath = FilePane.getCurrentPath(activeEditor);
  if (!currentPath) return Result.error("no current path");
  const viewColumn = FilePane.nextViewColumn(split, activeEditor);

  return pipeAsync(
    currentPath,
    Projection.findAlternateFile,
    Result.asyncChainOk((newPath: string) =>
      FilePane.open(viewColumn, newPath)
    ),
    Result.mapError(logError)
  );
};

export const createFile = ({ split }: Options) => async (): Result.P<
  string,
  string
> => {
  const activeEditor = FilePane.getActiveEditor();
  if (!activeEditor) return Result.error("no active editor");
  const currentPath = FilePane.getCurrentPath(activeEditor);
  if (!currentPath) return Result.error("no current path");
  const viewColumn = FilePane.nextViewColumn(split, activeEditor);

  return pipeAsync(
    currentPath,
    Projection.findOrCreateAlternateFile,
    Result.asyncChainOk((newPath: string) =>
      FilePane.open(viewColumn, newPath)
    ),
    Result.mapError(logError)
  );
};

const logError = (error: AlternateFileNotFoundError.t | string): string => {
  const message: string = AlternateFileNotFoundError.isAlternateFileNotFoundError(
    error
  )
    ? error.message
    : error;

  vscode.window.showErrorMessage(message);
  return message;
};
