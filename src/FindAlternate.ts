import * as vscode from "vscode";
import * as path from "path";

import { compact, findValue } from "./utils";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";
import * as Result from "./Result";

export const openFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => async (): Promise<void> => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return;
  const currentPath = getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = nextViewColumn(split, activeEditor);

  const pathResponse = await findAlternatePath(patterns, currentPath);

  Result.either(
    newPath => FilePath.open(viewColumn, newPath),
    possiblePaths =>
      vscode.window.showErrorMessage(
        `Couldn't find an alternate file for ${currentPath}. Tried: ${possiblePaths}`
      ),
    pathResponse
  );
};

export const createFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => async (): Promise<void> => {
  const activeEditor = getActiveEditor();
  if (!activeEditor) return;
  const currentPath = getCurrentPath(activeEditor);
  if (!currentPath) return;
  const viewColumn = nextViewColumn(split, activeEditor);

  const pathResponse = await findAlternatePath(patterns, currentPath);

  Result.either(
    newPath => FilePath.open(viewColumn, newPath),
    (): void => {
      const newPath = makeAlternatePath(patterns, currentPath);
      const workspacePath = currentWorkspacePath(activeEditor);

      if (newPath && workspacePath) {
        FilePath.create(viewColumn, path.join(workspacePath, newPath));
      } else {
        vscode.window.showErrorMessage(
          `Couldn't create an alternate file for ${currentPath}: it didn't match any known patterns.`
        );
      }
    },
    pathResponse
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

const findAlternatePath = async (
  patterns: AlternatePattern.t[],
  path: string
): Promise<Result.R<string, string[]>> => {
  const possiblePaths = compact(
    patterns.map(AlternatePattern.alternatePath(path))
  );
  try {
    const alternatePath = await FilePath.findExisting(possiblePaths);
    return { ok: alternatePath };
  } catch (e) {
    return { error: possiblePaths };
  }
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
