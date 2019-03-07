import * as vscode from "vscode";
import {
  asyncChainOk,
  error,
  mapError,
  pipeAsync,
  ResultP
} from "result-async";

import * as FilePane from "./FilePane";
import {
  AlternateFileNotFoundError,
  isAlternateFileNotFoundError,
  findAlternateFile,
  findOrCreateAlternateFile
} from "alternate-file";

export interface Options {
  split: boolean;
}

export const openFile = ({ split }: Options) => async (): ResultP<
  string,
  string
> => {
  const activeEditor = FilePane.getActiveEditor();
  if (!activeEditor) return error("no active editor");
  const currentPath = FilePane.getCurrentPath(activeEditor);
  if (!currentPath) return error("no current path");
  const viewColumn = FilePane.nextViewColumn(split, activeEditor);

  return pipeAsync(
    currentPath,
    findAlternateFile,
    asyncChainOk((newPath: string) => FilePane.open(viewColumn, newPath)),
    mapError(logError)
  );
};

export const createFile = ({ split }: Options) => async (): ResultP<
  string,
  string
> => {
  const activeEditor = FilePane.getActiveEditor();
  if (!activeEditor) return error("no active editor");
  const currentPath = FilePane.getCurrentPath(activeEditor);
  if (!currentPath) return error("no current path");
  const viewColumn = FilePane.nextViewColumn(split, activeEditor);

  return pipeAsync(
    currentPath,
    findOrCreateAlternateFile,
    asyncChainOk((newPath: string) => FilePane.open(viewColumn, newPath)),
    mapError(logError)
  );
};

const logError = (error: AlternateFileNotFoundError | string): string => {
  const message: string = isAlternateFileNotFoundError(error)
    ? error.message
    : error;

  vscode.window.showErrorMessage(message);
  return message;
};
