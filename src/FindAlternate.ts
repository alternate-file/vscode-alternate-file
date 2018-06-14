import * as vscode from "vscode";
import * as path from "path";

import { compact, findValue } from "./utils";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";

export const openFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => (): void => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return;
  const currentPath = getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = nextViewColumn(split, activeEditor);

  findAlternatePath(patterns, currentPath).then(
    newPath => FilePath.open(viewColumn, newPath),
    () => console.log("alternate file not found")
  );
};

export const createFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => (): void => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return;
  const currentPath = getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = nextViewColumn(split, activeEditor);

  findAlternatePath(patterns, currentPath).then(
    newPath => FilePath.open(viewColumn, newPath),
    (): void => {
      const newPath = makeAlternatePath(patterns, currentPath);
      const workspacePath = currentWorkspacePath(activeEditor);

      if (newPath && workspacePath) {
        FilePath.create(viewColumn, path.join(workspacePath, newPath));
      } else {
        console.log("pattern not found!");
      }
    }
  );
};

const getActiveEditor = (): vscode.TextEditor | null =>
  vscode.window.activeTextEditor || null;

const getCurrentPath = (activeEditor: vscode.TextEditor): string | null =>
  relativePath(activeEditor);

const currentWorkspacePath = (
  activeEditor: vscode.TextEditor
): string | null => {
  const workspace = vscode.workspace.getWorkspaceFolder(
    activeEditor.document.uri
  );

  if (!isWorkspaceValid(workspace)) return null;

  return workspace.uri.fsPath;
};

const nextViewColumn = (
  split: boolean,
  activeEditor: vscode.TextEditor
): number => {
  if (!activeEditor.viewColumn) return 0;
  if (!split) return -1;
  return activeEditor.viewColumn + 1;
};

const relativePath = (activeEditor: vscode.TextEditor) => {
  const path = vscode.workspace.asRelativePath(activeEditor.document.uri);
  return path ? path.replace(/\\/g, "/") : null;
};

const findAlternatePath = (
  patterns: AlternatePattern.t[],
  path: string
): Thenable<string> => {
  const possiblePaths = patterns.map(AlternatePattern.alternatePath(path));
  return FilePath.findExisting(compact(possiblePaths));
};

const makeAlternatePath = (
  patterns: AlternatePattern.t[],
  path: string
): string | null => {
  const relativePath = findValue(
    AlternatePattern.alternatePath(path),
    patterns
  );
  return relativePath || null;
};

const isWorkspaceValid = (
  workspace: vscode.WorkspaceFolder | undefined
): workspace is vscode.WorkspaceFolder =>
  workspace !== undefined && workspace.uri.scheme === "file";
