import * as assert from "assert";

import * as utils from "../utils";

suite("utils", () => {
  test("cons", () => {
    const array = [1, 2];
    assert.deepEqual(utils.cons(3, array), [3, 1, 2]);
  });
});
