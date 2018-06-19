import * as vscode from "vscode";

import { compact, findValue } from "./utils";
import * as ActiveEditor from "./ActiveEditor";
import * as AlternatePattern from "./AlternatePattern";
import * as FilePath from "./FilePath";
import * as Result from "./Result";
import * as Workspace from "./Workspace";

export const openFile = (
  patterns: AlternatePattern.t[],
  { split }: { split: boolean }
) => async (): Promise<void> => {
  const activeEditor = ActiveEditor.getActiveEditor();
  if (!activeEditor) return;
  const currentPath = ActiveEditor.getCurrentPath();
  if (!currentPath) return;
  const viewColumn = ActiveEditor.getNextViewColumn(split);

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
  const activeEditor = ActiveEditor.getActiveEditor();
  if (!activeEditor) return;
  const currentPath = ActiveEditor.getCurrentPath();
  if (!currentPath) return;
  const viewColumn = ActiveEditor.getNextViewColumn(split);

  const pathResponse = await findAlternatePath(patterns, currentPath);

  Result.either(
    newPath => FilePath.open(viewColumn, newPath),
    (): void => {
      const newPath = makeAlternatePath(patterns, currentPath);

      const fullPath = Workspace.pathInActiveWorkspace(newPath);

      if (fullPath) {
        FilePath.create(viewColumn, fullPath);
      } else {
        vscode.window.showErrorMessage(
          `Couldn't create an alternate file for ${currentPath}: it didn't match any known patterns.`
        );
      }
    },
    pathResponse
  );
};

const findAlternatePath = async (
  patterns: AlternatePattern.t[],
  path: string
): Promise<Result.t<string, string[]>> => {
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
