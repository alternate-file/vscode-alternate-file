import * as vscode from "vscode";

export const getActiveEditor = (): vscode.TextEditor | null =>
  vscode.window.activeTextEditor || null;

export const getCurrentPath = (): string | null => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return null;

  return relativePath(activeEditor);
};

export const getNextViewColumn = (split: boolean): number => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return 0;
  if (!activeEditor.viewColumn) return 0;
  if (!split) return -1;
  return activeEditor.viewColumn + 1;
};

const relativePath = (activeEditor: vscode.TextEditor) => {
  const path = vscode.workspace.asRelativePath(activeEditor.document.uri);
  return path ? path.replace(/\\/g, "/") : null;
};
