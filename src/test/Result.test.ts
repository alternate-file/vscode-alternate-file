import * as assert from "assert";

import * as Result from "../Result";

suite("Result", () => {
  test("ok", () => {
    assert.equal(Result.ok(1), { ok: 1 });
  });
});
