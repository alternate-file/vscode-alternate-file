import * as vscode from "vscode";
import { exists } from "./utils";

export type t = string;

export const open = (doSplit: boolean) => (filePath: t | null): void => {
  if (!filePath) return;

  if (doSplit) {
    openFileInSplit(filePath);
  } else {
    openFileInPane(filePath);
  }
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
  vscode.window.showTextDocument(fileUri);
};

const openFileInSplit = (filePath: t): void => {
  vscode.commands.executeCommand("workbench.action.splitEditor");
  openFileInPane(filePath);
};
