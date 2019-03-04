import * as Projection from "./Projections";

describe("Projection", () => {
  it("projectionsToAlternatePatterns parses *", () => {
    const projections: Projection.t = {
      "src/*.ts": { alternate: "src/test/{}.test.ts" },
      "app/*.rb": { alternate: "test/{}_spec.rb" }
    };

    expect(Projection.projectionsToAlternatePatterns(projections)).toEqual([
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

  it("projectionsToAlternatePatterns parses ** and *", () => {
    const projections: Projection.t = {
      "src/**/*.ts": { alternate: "src/{dirname}/__test__/{basename}.test.ts" }
    };

    expect(Projection.projectionsToAlternatePatterns(projections)).toEqual([
      {
        main: "src/{dirname}/{basename}.ts",
        alternate: "src/{dirname}/__test__/{basename}.test.ts"
      }
    ]);
  });

  it("projectionsToAlternatePatterns parses multiple", () => {
    const projections: Projection.t = {
      "src/*.ts": {
        alternate: [
          "src/test/{}.test.ts",
          "src/{dirname}/__test__/{basename}.test.ts"
        ]
      }
    };

    expect(Projection.projectionsToAlternatePatterns(projections)).toEqual([
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
