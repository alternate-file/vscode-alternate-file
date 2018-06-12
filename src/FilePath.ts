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

export const findExisting = async (filePaths: t[]): Promise<t> => {
  const uris: vscode.Uri[] = await Promise.all(filePaths.map(findFileUri));
  const path = findFirstUriPath(uris);
  if (!path) throw new Error("path not found");

  return path;
};

export const findFileUri = (filePath: t): Thenable<vscode.Uri> =>
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
