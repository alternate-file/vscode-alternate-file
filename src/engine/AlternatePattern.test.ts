// import * as path from "path";
import * as AlternatePattern from "./AlternatePattern";

describe("AlternatePattern", () => {
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

  // const projectionsPath = path.resolve("./test-project/.projections.json");
  const projectionsPath = "/project/.projections.json";

  describe("alternatePath", () => {
    it("finds an implementation from a test", () => {
      expect(
        AlternatePattern.alternatePath(
          "src/components/__test__/Foo.test.ts",
          projectionsPath
        )(patterns[0])
      ).toBe("/project/src/components/Foo.ts");
    });

    it("finds alternate for short path", () => {
      expect(
        AlternatePattern.alternatePath("app/foo.rb", projectionsPath)(
          patterns[1]
        )
      ).toBe("/project/test/foo_spec.rb");
    });

    it("finds ts specs", () => {
      expect(
        AlternatePattern.alternatePath("./src/foo/bar.ts", projectionsPath)(
          patterns[0]
        )
      ).toBe("/project/src/foo/__test__/bar.test.ts");
    });

    it("returns null for non-matches", () => {
      expect(
        AlternatePattern.alternatePath("src/foo.rb", projectionsPath)(
          patterns[0]
        )
      ).toBe(null);
    });
  });
});
