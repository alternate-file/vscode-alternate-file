import * as vscode from "vscode";
import { okChainAsync, error, errorThen, ResultP } from "result-async";
import { pipeA } from "pipeout";

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

  // prettier-ignore
  return pipeA
    (currentPath)
    (findAlternateFile)
    (okChainAsync((newPath: string) => FilePane.open(viewColumn, newPath)))
    (errorThen(logError))
    .value
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

  // prettier-ignore
  return pipeA
    (currentPath)
    (findOrCreateAlternateFile)
    (okChainAsync((newPath: string) => FilePane.open(viewColumn, newPath)))
    (errorThen(logError))
    .value
};

const logError = (error: AlternateFileNotFoundError | string): string => {
  const message: string = isAlternateFileNotFoundError(error)
    ? error.message
    : error;

  vscode.window.showErrorMessage(message);
  return message;
};
