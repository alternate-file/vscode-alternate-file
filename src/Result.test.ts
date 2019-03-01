import * as Result from "./Result";

const add1 = (n: number) => n + 1;

describe("Result", () => {
  it("wraps with ok", () => {
    expect(Result.ok(1)).toEqual({ ok: 1 });
  });

  it("wraps an error", () => {
    expect(Result.error(1)).toEqual({ error: 1 });
  });

  describe("mapOk", () => {
    it("runs on an ok", () => {
      const result = { ok: 1 };

      expect(Result.mapOk(add1)(result)).toEqual({ ok: 2 });
    });

    it("passes through an error", () => {
      const result = { error: "bad" };

      expect(Result.mapOk(add1)(result)).toEqual({ error: "bad" });
    });
  });

  describe("mapError", () => {
    it("runs on an error", () => {
      const result = { error: 1 };

      expect(Result.mapError(add1)(result)).toEqual({ error: 2 });
    });

    it("passes through an error", () => {
      const result = { ok: "good" };

      expect(Result.mapError(add1)(result)).toEqual({ ok: "good" });
    });
  });
});
