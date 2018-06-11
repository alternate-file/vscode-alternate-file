# vscode-switch-to-spec README

It's nice that VS Code has a list of open files in the file explorer, but I'd like to fuzzy search that like I can Cmd/Ctrl-P. This lets you do that.

If you're used to using vim `buffers`, particular with `fzf`, this may be for you.

Note that with this, you may want to turn off the open files list with

```json
"explorer.openEditors.visible": 0,
```

You might also want to turn off the "preview" functionality that makes single-clicking a file, then single-clicking another file, close the first file.

```json
"workbench.editor.enablePreview": false,
"workbench.editor.enablePreviewFromQuickOpen": false,
```

## Features

To open a file list, press Ctrl-Shift-P (Cmd-Shift-P on Mac) to open the command pane, then type `Open Buffer` and press Enter. This will give you a list of currently open buffers. Select one to jump to it.

Closing a file with the X button will remove it from this list.

## Known Issues

- When VS Code opens with some files already open, Open Buffer won't list those files until you view them.

## Release Notes

### 0.0.1

- Added basic Open Buffer command
