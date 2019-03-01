# vscode-alternate-file

In Vim, you can often go to the "alternate file" for the active buffer - usually the spec file for an implementation, or vice versa - by pressing `:A`. This extension adds that functionality to VS Code.

VSCode-Alternate reads a config file based on the `.projections.json` file from [Tim Pope's Projectionist](https://github.com/tpope/vim-projectionist). This lets you specify where the spec files for different types of files in your project are set up. One you add a `.projections.json` (and reload your editor), you can then jump between an implementation and spec file, and optionally create empty files if they don't exist.

## Features

All commands are under the control pane. Or, you can set up [shortcuts](#shortcuts).

- `Alternate File` - Switch to the alternate file (if found) in the current pane
- `Split Alternate File` - Switch to the alternate file (if found) in a split pane
- `Create Alternate File` - Switch to the alternate file (if found) in the current pane. If not found, create the file.
- `Create Split Alternate File` - Switch to the alternate file (if found) in a split pane. If not found, create the file.

## .projections.json

To describe your project's layout, create a `.projections.json` in the root of your project.

Each line should have the pattern for an implementation file as the key, and an object with the pattern for the alternate file (usually the spec file, but it can be whatever you want). Use a `*` in the main pattern and a `{}` in the alternate pattern to note the part of the path that should be the same between the two files. A `*` can stand in for an arbitraritly nested

### Split paths

If your test paths have an extra directly in the middle of them, like with `app/some/path/__test__/file.test.js` with Jest, you can use `{dirname}` for the directory path and `{basename}` for the filename. You can do the same thing on the implementation side with the standard glob syntax: `**` to represent the directory path, and `*` to represent the filename, like `app/**/something/*.js`.

### Multiple alternates

If your project is inconsistent about where specs go (it happens to the best of us), you can also pass an array to `alternate`. The extension will look for a file matching the first alternate, then the second, and so on. When you create an alternate file, it will always follow the first pattern.

Note that this isn't part of the original `projectionist` spec, but it's sometimes handy.

### Examples

```js
{
  // Basic
  // app/foo/bar/file.js => app/foo/bar/file.spec.js
  "app/*.js": { "alternate": "app/{}.spec.js" },
  // Dirname/Basename
  // app/foo/bar/file.js => app/foo/bar/__test__/file.test.js
  "*.js": { "alternate": "{dirname}/__test__/{basename}.test.js" },
  // Globbed implementation:
  // app/foo/bar/js/file.js => test/foo/bar/file_test.js
  "app/**/js/*.js": { "alternate": "test/{}/_test.js" },
  // Multiple alternatives
  // app/foo/bar/file.jsx =>
  //   app/foo/bar/file.spec.jsx OR app/foo/bar/file.spec.js OR spec/js/foo/bar/file_spec.js
  "app/*.jsx": { "alternate": ["app/{}.spec.jsx", "app/{}.spec.js", "spec/js/{}_spec.js"] }
}
```

For `.projections.json` files for popular frameworks, see the [sample-projections](/sample-projections). If your framework isn't in there, PRs for new sample-projections are welcome!

## Shortcuts

There aren't any shortcuts set up by default. If you'd like to add some shortcuts, you can put `Open Keyboard Shortcuts File` in the command pane and add something like the following:

```json
{
  "key": "ctrl+alt+a",
  "command": "alternate.alternateFile",
  "when": "editorTextFocus"
}
```

The commands are:

```text
alternate.alternateFile
alternate.alternateFileInSplit
alternate.createAlternateFile
alternate.createAlternateFileInSplit
```

### Vim support

If you use [vscode-vim](https://github.com/VSCodeVim/Vim), it might be easier to add a leader-key shortcut, like the alternate file command from [Spacemacs](https://github.com/syl20bnr/spacemacs/blob/master/doc/DOCUMENTATION.org#managing-projects)

```json
{
  "before": ["<leader>", "p", "a"],
  "commands": [{ "command": "alternate.alternateFile" }]
}
```

Unfortunately you don't seem to be able to add your own ex-commands to vscode-vim, so you can't set up `:A`.

## Contributing

### Run Tests

Click the Debug button in the sidebar and run `Extension Tests`

### Deploy to a local VS Code

Click the Debug button in the sidebar and run `Extension`

## Roadmap

- Support all the transformations from Projectionist, not just `dirname` and `basename`.
- Support the "type" attribute in `.projections.json`, and allow for switching by filetype, like "controller".

## Release Notes

### master

- Better error messages when trying to run a command without a `.projections.json`

### 0.1.0

- Rename "alternates" array to "alternate"
- Better error messages
- Watch .projections.json for changes

### 0.0.1

- Support switching to and creating alternative files
