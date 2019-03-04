import * as assert from "assert";

import * as utils from "../utils";

describe("utils", () => {
  it("cons", () => {
    const array = [1, 2];
    assert.deepEqual(utils.cons(3, array), [3, 1, 2]);
  });

  it("find", () => {
    const greaterThan1 = (x: number) => x > 1;

    assert.equal(utils.find(greaterThan1, [1, 2, 3]), 2);
    assert.equal(utils.find(greaterThan1, [-1, -2]), null);
  });

  it("to pairs", () => {
    assert.deepEqual(utils.toPairs({ a: "a", b: "b" }), [
      ["a", "a"],
      ["b", "b"]
    ]);
  });
});
