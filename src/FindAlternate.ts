import * as vscode from "vscode";
import * as path from "path";

import { compact, findValue } from "./utils";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";

export const openFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => (): void => {
  const currentPath = getCurrentPath();
  if (!currentPath) return;

  findAlternatePath(patterns, currentPath).then(
    newPath => FilePath.open(split)(newPath),
    () => console.log("alternate file not found")
  );
};

export const createFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => (): void => {
  const currentPath = getCurrentPath();
  if (!currentPath) return;

  findAlternatePath(patterns, currentPath).then(
    newPath => FilePath.open(split)(newPath),
    (): void => {
      const newPath = makeAlternatePath(patterns, currentPath);
      const workspacePath = currentWorkspacePath();

      if (newPath && workspacePath) {
        FilePath.create(split)(path.join(workspacePath, newPath));
      } else {
        console.log("pattern not found!");
      }
    }
  );
};

const getCurrentPath = (): string | null => {
  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) return null;

  return relativePath(activeEditor);
};

const currentWorkspacePath = (): string | null => {
  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) return null;

  const workspace = vscode.workspace.getWorkspaceFolder(
    activeEditor.document.uri
  );

  if (!isWorkspaceValid(workspace)) return null;

  return workspace.uri.fsPath;
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
