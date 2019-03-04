import * as vscode from "vscode";
import * as path from "path";
import * as assert from "assert";

import * as FilePane from "../FilePane";

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
  },
  {
    description: "are missing",
    implementation: "js/untested-file.ts",
    spec: "js/untested-file.ts"
  }
];

describe("Extension Tests", () => {
  describe("alternateFile", () => {
    testCases.map(({ description, implementation, spec }) => {
      describe(`given tests ${description}`, () => {
        it("finds a test", () => openAndCheck(implementation, spec));

        it("finds an implementation", () => openAndCheck(spec, implementation));
      });
    });
  });
});

const openAndCheck = async (
  startingFile: string,
  endingFile: string
): Promise<any> => {
  // Start with one file.
  const startingFilePath = absolutePath(startingFile);
  await FilePane.open(0, startingFilePath);

  // Execute the command
  await vscode.commands.executeCommand("alternate.alternateFile");

  // Get the currently open file
  const activeEditor = FilePane.getActiveEditor();
  if (activeEditor === null) throw "No active editor!";

  const currentPath = FilePane.getCurrentPath(activeEditor);
  if (currentPath === null) throw "No current path!";

  // It should be the matching file.
  return assert.equal(currentPath, absolutePath(endingFile));
};

const absolutePath = (relativePath: string) =>
  path.resolve(vscode.workspace.rootPath || "", relativePath);
