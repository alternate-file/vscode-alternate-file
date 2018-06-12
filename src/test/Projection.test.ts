import * as assert from "assert";

import * as Projection from "../Projection";

suite("Projection", () => {
  const projections: Projection.t = {
    "src/*.ts": { alternate: "src/test/*.test.ts" },
    "app/*.rb": { alternate: "test/*_spec.rb" }
  };

  test("alternatePath finds ts specs", () => {
    assert.deepEqual(Projection.projectionsToAlternatePatterns(projections), [
      { src: "src/*.ts", spec: "src/test/*.test.ts" },
      { src: "app/*.rb", spec: "test/*_spec.rb" }
    ]);
  });
});
