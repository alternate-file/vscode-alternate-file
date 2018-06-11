import * as vscode from "vscode";
import * as path from "path";

import { remove, uniqueCons, map } from "./utils";

const invalidBuffer = /\.git$/;

export class OpenBuffers {
  private files: string[] = [];

  constructor(buffers: vscode.TextDocument[] = []) {
    this.files = buffers.filter(isValidBuffer).map(buffer => buffer.fileName);
  }

  onBufferOpen = (buffer: vscode.TextDocument): void => {
    if (!isValidBuffer(buffer)) return;

    this.files = uniqueCons(buffer.fileName, this.files);
  };

  onBufferClose = (buffer: vscode.TextDocument): void => {
    if (!isValidBuffer(buffer)) return;

    this.files = remove(buffer.fileName, this.files);
  };

  openBuffer = async () => {
    const quickPicks = toQuickPicks(this.files);
    const picked = await vscode.window.showQuickPick(quickPicks, {
      matchOnDescription: true
    });

    if (picked) {
      const filePath = quickPickToPath(picked);
      const fileUri = vscode.Uri.file(filePath);
      vscode.window.showTextDocument(fileUri);
    }
  };
}

const isValidBuffer = (buffer: vscode.TextDocument): boolean =>
  !invalidBuffer.test(buffer.fileName);

const toQuickPick = (filePath: string): vscode.QuickPickItem => {
  const fileName = path.basename(filePath);
  const directory = path.dirname(filePath);

  return {
    label: fileName,
    description: directory
  };
};

const quickPickToPath = ({
  label,
  description
}: vscode.QuickPickItem): string => path.join(description || "", label);

const toQuickPicks = map(toQuickPick);
