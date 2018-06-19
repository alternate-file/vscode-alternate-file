import * as vscode from "vscode";
import * as path from "path";

import * as ActiveEditor from "./ActiveEditor";

export const getActiveWorkspace = (): vscode.WorkspaceFolder | null => {
  const activeEditor = ActiveEditor.getActiveEditor();

  if (activeEditor) {
    return (
      vscode.workspace.getWorkspaceFolder(activeEditor.document.uri) || null
    );
  }
  if (!vscode.workspace.workspaceFolders) {
    return null;
  }

  const workspace = vscode.workspace.workspaceFolders[0];
  if (!isWorkspaceValid(workspace)) {
    return null;
  }

  return workspace;
};

export const getActiveWorkspacePath = (): string | null => {
  const workspace = getActiveWorkspace();

  return workspace ? workspace.uri.fsPath : null;
};

export const pathInActiveWorkspace = (filePath: string | null): string | null => {
  const workspacePath = getActiveWorkspacePath();
  if (!workspacePath || !filePath) return null;

  return path.join(workspacePath, filePath);
};

const isWorkspaceValid = (
  workspace: vscode.WorkspaceFolder | undefined
): workspace is vscode.WorkspaceFolder =>
  workspace !== undefined && workspace.uri.scheme === "file";
