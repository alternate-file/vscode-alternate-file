import * as vscode from "vscode";

import { compact, findValue } from "./utils";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";

export const openFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => (): void => {
  const path = currentPath();
  if (!path) return;

  findAlternatePath(patterns, path).then(
    path => FilePath.open(split)(path),
    () => console.log("alternate file not found")
  );
};

export const createFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => (): void => {
  const path = currentPath();
  if (!path) return;

  findAlternatePath(patterns, path).then(
    path => FilePath.open(split)(path),
    (): void => {
      const newPath = makeAlternatePath(patterns, path);

      if (newPath) {
        FilePath.open(split)(path)
      } else {
        console.log("pattern not found!");
      }
    }
  );
};

const currentPath = (): string | null => {
  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) return null;

  return relativePath(activeEditor);
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
  const relativePath = findValue(AlternatePattern.alternatePath(path), patterns);
  if (!relativePath) return null;
  return ""
}
