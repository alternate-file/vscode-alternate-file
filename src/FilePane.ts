import * as vscode from "vscode";

export type t = string;

export const open = async (
  viewColumn: number,
  filePath: t | null
): Promise<vscode.TextEditor | null> => {
  if (!filePath) return null;

  const fileUri = vscode.Uri.file(filePath);
  return vscode.window.showTextDocument(fileUri, { viewColumn });
};

export const create = async (
  viewColumn: number,
  filePath: t
): Promise<vscode.TextEditor | null> => {
  if (!filePath) return null;

  const newFileUri = vscode.Uri.parse(`untitled:${filePath}`);
  const doc = await vscode.workspace.openTextDocument(newFileUri);

  return vscode.window.showTextDocument(doc, { viewColumn });
};
