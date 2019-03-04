import * as utils from "./utils";

describe("log", () => {
  it("returns the passing in data", () => {
    jest
      .spyOn(console, "log")
      .mockImplementation((...args: any[]) => (x: any) => x);

    expect(utils.log("a test")(1)).toBe(1);
  });
});
