import * as vscode from "vscode";
import { prop } from "./utils";
import { OpenBuffers } from "./open-buffers";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('"vscode-open-buffers" is now active');

  const buffers = vscode.window.visibleTextEditors.map(prop("document"));
  const openBuffers = new OpenBuffers(buffers);

  vscode.workspace.onDidOpenTextDocument(openBuffers.onBufferOpen);
  vscode.workspace.onDidCloseTextDocument(openBuffers.onBufferClose);

  const commands = [
    vscode.commands.registerCommand("open-buffers.openBuffer", openBuffers.openBuffer)
  ];

  commands.forEach(command => context.subscriptions.push(command));
}

// this method is called when your extension is deactivated
export function deactivate() {}
