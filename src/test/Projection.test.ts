import * as assert from "assert";

import * as Projection from "../Projection";

suite("Projection", () => {
  test("projectionsToAlternatePatterns parses *", () => {
    const projections: Projection.t = {
      "src/*.ts": { alternate: "src/test/{}.test.ts" },
      "app/*.rb": { alternate: "test/{}_spec.rb" }
    };

    assert.deepEqual(Projection.projectionsToAlternatePatterns(projections), [
      {
        main: "src/{dirname}/{basename}.ts",
        alternate: "src/test/{dirname}/{basename}.test.ts"
      },
      {
        main: "app/{dirname}/{basename}.rb",
        alternate: "test/{dirname}/{basename}_spec.rb"
      }
    ]);
  });

  test("projectionsToAlternatePatterns parses ** and *", () => {
    const projections: Projection.t = {
      "src/**/*.ts": { alternate: "src/{dirname}/__test__/{basename}.test.ts" }
    };

    assert.deepEqual(Projection.projectionsToAlternatePatterns(projections), [
      {
        main: "src/{dirname}/{basename}.ts",
        alternate: "src/{dirname}/__test__/{basename}.test.ts"
      }
    ]);
  });

  test("projectionsToAlternatePatterns parses multiple", () => {
    const projections: Projection.t = {
      "src/*.ts": {
        alternates: [
          "src/test/{}.test.ts",
          "src/{dirname}/__test__/{basename}.test.ts"
        ]
      }
    };

    assert.deepEqual(Projection.projectionsToAlternatePatterns(projections), [
      {
        main: "src/{dirname}/{basename}.ts",
        alternate: "src/test/{dirname}/{basename}.test.ts"
      },
      {
        main: "src/{dirname}/{basename}.ts",
        alternate: "src/{dirname}/__test__/{basename}.test.ts"
      }
    ]);
  });
});
