import * as vscode from "vscode";

import { compact } from "./utils";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";

export const openFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => (): void => {
  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) return;

  const path = relativePath(activeEditor);

  if (!path) return;

  findAlternatePath(patterns, path).then(path => {
    if (path) {
      FilePath.open(split)(path);
    }
  });
};

export const createFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => (): void => {
  // TODO
};

const relativePath = (activeEditor: vscode.TextEditor) => {
  const path = vscode.workspace.asRelativePath(activeEditor.document.uri);
  return path ? path.replace(/\\/g, "/") : null;
};

const findAlternatePath = (
  patterns: AlternatePattern.t[],
  path: string
): Thenable<string | null> => {
  const possiblePaths = patterns.map(AlternatePattern.alternatePath(path));
  return FilePath.findExisting(compact(possiblePaths));
};
