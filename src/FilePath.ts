import * as vscode from "vscode";

import { exists } from "./utils";

export type t = string;

export const open = (viewColumn: number, filePath: t | null): void => {
  if (!filePath) return;

  openFileInPane(viewColumn, filePath);
};

export const create = (
  viewColumn: number,
  filePath: t,
  template: string[] = []
): void => {
  if (!filePath) return;

  createFileInPane(viewColumn, filePath, template);
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

const openFileInPane = (viewColumn: number, filePath: t): void => {
  const fileUri = vscode.Uri.file(filePath);
  vscode.window.showTextDocument(fileUri, { viewColumn });
};

const createFileInPane = async (
  viewColumn: number,
  filePath: t,
  template: string[]
): Promise<vscode.TextEditor> => {
  const newFileUri = vscode.Uri.parse(`untitled:${filePath}`);

  // Open and display document
  const doc = await vscode.workspace.openTextDocument(newFileUri);

  // Add template text.
  writeToDoc(doc, template.join("\n"));

  return vscode.window.showTextDocument(doc, { viewColumn });
};

const writeToDoc = (doc: vscode.TextDocument, text: string): void => {
  const firstLine = doc.lineAt(0);
  const workspaceEdit = new vscode.WorkspaceEdit();

  workspaceEdit.insert(doc.uri, firstLine.range.start, text);
};
