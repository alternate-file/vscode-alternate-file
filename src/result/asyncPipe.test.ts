import { pipeAsync } from "./asyncPipe";

describe("asyncPipe", () => {
  describe("pipeAsync", () => {
    it("does things async", async () => {
      const asyncAddOne = jest
        .fn()
        .mockImplementation(async (n: number) => n + 1);

      await pipeAsync(1, asyncAddOne, asyncAddOne);

      expect(asyncAddOne).toHaveBeenCalledTimes(2);

      expect(asyncAddOne).toHaveBeenNthCalledWith(1, 1);
      expect(asyncAddOne).toHaveBeenNthCalledWith(2, 2);
    });
  });
});
