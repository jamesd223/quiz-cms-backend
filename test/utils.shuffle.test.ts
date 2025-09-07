import { deterministicShuffle } from "../src/utils/shuffle.js";

describe("deterministicShuffle", () => {
  it("produces same output for same seed", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const a = deterministicShuffle(input, "seed");
    const b = deterministicShuffle(input, "seed");
    expect(a).toEqual(b);
  });
});
