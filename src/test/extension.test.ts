import * as assert from "assert";

describe("Extension Tests", () => {
  // Defines a Mocha unit test
  it("Something 1", () => {
    assert.equal(-1, [1, 2, 3].indexOf(5));
    assert.equal(-1, [1, 2, 3].indexOf(0));
  });
});
