// The module 'assert' provides assertion methods from node
import * as assert from "assert";

import * as AlternatePattern from "../AlternatePattern";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite("AlternatePattern", () => {
  const patterns: AlternatePattern.t[] = [
    { main: "src/*.ts", alternate: "src/test/*.test.ts" },
    { main: "app/*.rb", alternate: "test/*_spec.rb" }
  ];

  test("alternatePath finds ts specs", () => {
    assert.equal(
      AlternatePattern.alternatePath("src/foo/bar.ts")(patterns[0]),
      "src/test/foo/bar.test.ts"
    );
  });

  test("alternatePath finds implementations", () => {
    assert.equal(
      AlternatePattern.alternatePath("app/controllers/foo_controller.rb")(
        patterns[1]
      ),
      "test/controllers/foo_controller_spec.rb"
    );
  });

  test("returns null for non-matches", () => {
    assert.equal(
      AlternatePattern.alternatePath("src/foo.rb")(patterns[0]),
      null
    );
  });
});
