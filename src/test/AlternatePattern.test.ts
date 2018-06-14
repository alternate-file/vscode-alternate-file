import * as assert from "assert";

import * as AlternatePattern from "../AlternatePattern";

suite("AlternatePattern", () => {
  const patterns: AlternatePattern.t[] = [
    {
      main: "src/{dirname}/{basename}.ts",
      alternate: "src/{dirname}/__test__/{basename}.test.ts"
    },
    {
      main: "app/{dirname}/{basename}.rb",
      alternate: "test/{dirname}/{basename}_spec.rb"
    }
  ];

  test("alternatePath finds implementations", () => {
    assert.equal(
      AlternatePattern.alternatePath("app/controllers/foo_controller.rb")(
        patterns[1]
      ),
      "test/controllers/foo_controller_spec.rb"
    );
  });

  test("alternatePath finds ts specs", () => {
    assert.equal(
      AlternatePattern.alternatePath("src/foo/bar.ts")(patterns[0]),
      "src/foo/__test__/bar.test.ts"
    );
  });

  test("returns null for non-matches", () => {
    assert.equal(
      AlternatePattern.alternatePath("src/foo.rb")(patterns[0]),
      null
    );
  });
});
