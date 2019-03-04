import * as vscode from "vscode";
import * as R from "remeda";
import * as path from "path";
import * as assert from "assert";

import * as FilePane from "../FilePane";
import * as File from "../engine/File";

const testCases = [
  {
    description: "in the same directory",
    implementation: "js/simple-file.js",
    spec: "js/simple-file.test.js"
  },
  {
    description: "in a nested directory",
    implementation: "js/directory-test-file.js",
    spec: "js/__test__/directory-test-file.test.js"
  },
  {
    description: "in a parallel directory",
    implementation: "ruby/app/controllers/test_controller.rb",
    spec: "ruby/spec/controllers/test_controller_spec.rb"
  },
  {
    description: "are a secondary match",
    implementation: "js/js-tested-file.ts",
    spec: "js/js-tested-file.test.js"
  }
];

const untestedFile = "js/untested-file.ts";
const untestedFileSpec = "js/untested-file.test.ts";

describe("Extension Tests", () => {
  afterEach(() => {
    // Cleanup by closing the new pane.
    return vscode.commands.executeCommand(
      "workbench.action.closeEditorsInGroup"
    );
  });

  describe("alternateFile", () => {
    testCases.map(({ description, implementation, spec }) => {
      describe(`given tests ${description}`, () => {
        it("finds a test", () =>
          openAndCheck("alternate.alternateFile", 1, implementation, spec));

        it("finds an implementation", () =>
          openAndCheck("alternate.alternateFile", 1, spec, implementation));
      });
    });
  });

  describe("alternateFileInSplit", () => {
    testCases.map(({ description, implementation, spec }) => {
      describe(`given tests ${description}`, () => {
        it("finds a test", () =>
          openAndCheck(
            "alternate.alternateFileInSplit",
            2,
            implementation,
            spec
          ));

        it("finds an implementation", () =>
          openAndCheck(
            "alternate.alternateFileInSplit",
            2,
            spec,
            implementation
          ));
      });
    });
  });

  describe("given an untested file", () => {
    it("doesn't switch to alternate", () =>
      openAndCheck(
        "alternate.alternateFileInSplit",
        1,
        untestedFile,
        untestedFile
      ));

    it("doesn't switch to alternate or change panes", () =>
      openAndCheck(
        "alternate.alternateFileInSplit",
        1,
        untestedFile,
        untestedFile
      ));

    describe("given a creator command", () => {
      afterEach(() => {
        return R.pipe(
          untestedFileSpec,
          absolutePath,
          File.deleteFile
        );
      });
      it("creates a new alternate file", () =>
        openAndCheck(
          "alternate.createAlternateFile",
          1,
          untestedFile,
          untestedFileSpec
        ));

      it("creates a new alternate file in a new split", () =>
        openAndCheck(
          "alternate.createAlternateFileInSplit",
          2,
          untestedFile,
          untestedFileSpec
        ));
    });
  });
});

const openAndCheck = async (
  command: string,
  endingPane: number,
  startingFile: string,
  endingFile: string
): Promise<any> => {
  // Start with one file.
  const startingFilePath = absolutePath(startingFile);
  await FilePane.open(0, startingFilePath);

  // Execute the command
  await vscode.commands.executeCommand(command);

  // Get the currently open file
  const activeEditor = FilePane.getActiveEditor();
  if (activeEditor === null) throw "No active editor!";

  const currentPath = FilePane.getCurrentPath(activeEditor);
  if (currentPath === null) throw "No current path!";

  // It should be the matching file.
  assert.equal(currentPath, absolutePath(endingFile));
  // It should be in the expected pane.
  assert.equal(activeEditor.viewColumn, endingPane);
};

const absolutePath = (relativePath: string) =>
  path.resolve(vscode.workspace.rootPath || "", relativePath);
