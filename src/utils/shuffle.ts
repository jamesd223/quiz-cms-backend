// Deterministic shuffle using a seeded PRNG (xorshift128+ variant)
export function deterministicShuffle<T>(input: T[], seed: string): T[] {
  // Create numeric seed from string
  const seedHash = Array.from(seed).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
    0
  );
  let s0 = 0x9e3779b9 ^ seedHash;
  let s1 = 0x243f6a88 ^ (seedHash << 13);

  const rand = () => {
    let x = s0;
    const y = s1;
    s0 = y;
    x ^= x << 23;
    x ^= x >>> 17;
    x ^= y ^ (y >>> 26);
    s1 = x;
    const t = (x + y) >>> 0;
    return t / 0xffffffff;
  };

  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = tmp;
  }
  return arr;
}

export default deterministicShuffle;
