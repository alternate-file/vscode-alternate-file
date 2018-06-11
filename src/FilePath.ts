import * as vscode from "vscode";
import { exists } from "./utils";

export type t = string;

export const open = (doSplit: boolean) => (filePath: t | null): void => {
  if (!filePath) return;

  splitThenExecute(doSplit, openFileInPane, filePath);
};

export const create = (doSplit: boolean, filePath: t): void => {
  // TODO
};

export const findExisting = (filePaths: t[]): Thenable<t | null> =>
  Promise.all(filePaths.map(findMatchingFile)).then(findFirstUriPath);

const findMatchingFile = (filePath: t): Thenable<vscode.Uri> =>
  vscode.workspace.findFiles(filePath).then((files: vscode.Uri[]) => files[0]);

const findFirstUriPath = (uris: (vscode.Uri)[]): t | null => {
  const existingFile = uris.filter(exists)[0];
  return existingFile ? existingFile.path : null;
};

const openFileInPane = (filePath: t): void => {
  const fileUri = vscode.Uri.file(filePath);
  vscode.window.showTextDocument(fileUri, { viewColumn: -1 });
};

const splitThenExecute = (
  doSplit: boolean,
  f: (filePath: t) => void,
  filePath: t
): void => {
  if (doSplit) {
    vscode.commands
      .executeCommand("workbench.action.splitEditor")
      .then(() => f(filePath));
  } else {
    f(filePath);
  }
};
