import * as vscode from "vscode";

export type t = string;

export const open = (viewColumn: number, filePath: t | null): void => {
  if (!filePath) return;

  openFileInPane(viewColumn, filePath);
};

export const create = (viewColumn: number, filePath: t): void => {
  if (!filePath) return;

  createFileInPane(viewColumn, filePath);
};

export const findFileUri = (filePath: t): Thenable<vscode.Uri> =>
  vscode.workspace.findFiles(filePath).then((files: vscode.Uri[]) => files[0]);

const openFileInPane = (viewColumn: number, filePath: t): void => {
  const fileUri = vscode.Uri.file(filePath);
  vscode.window.showTextDocument(fileUri, { viewColumn });
};

const createFileInPane = async (
  viewColumn: number,
  filePath: t
): Promise<vscode.TextEditor> => {
  const newFileUri = vscode.Uri.parse(`untitled:${filePath}`);
  const doc = await vscode.workspace.openTextDocument(newFileUri);

  return vscode.window.showTextDocument(doc, { viewColumn });
};
