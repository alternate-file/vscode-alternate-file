import * as vscode from "vscode";

export type t = string;

/**
 * Open a file in a VS Code pane
 * @param viewColumn - The column to open the file in.
 * @param filePath - The path to the file to open
 */
export const open = async (
  viewColumn: number,
  filePath: t | null
): Promise<vscode.TextEditor | null> => {
  if (!filePath) return null;

  const fileUri = vscode.Uri.file(filePath);
  return vscode.window.showTextDocument(fileUri, { viewColumn });
};

/**
 * Get the VS Code editor object of the active editor, if any.
 * @returns a TextEditor if there's an active editor, or null if not
 */
export const getActiveEditor = (): vscode.TextEditor | null =>
  vscode.window.activeTextEditor || null;

/**
 * Get the absolute path to the active file.
 * @returns the path, or null if no active file
 */
export const getCurrentPath = (
  activeEditor: vscode.TextEditor
): string | null => {
  const path = activeEditor.document.uri.path;
  return path ? path.replace(/\\/g, "/") : null;
};

/**
 * For opening in a split pane.
 * @returns the number of the pane to the right of the active one.
 */
export const nextViewColumn = (
  split: boolean,
  activeEditor: vscode.TextEditor
): number => {
  if (!activeEditor.viewColumn) return 0;
  if (!split) return -1;
  return activeEditor.viewColumn + 1;
};
