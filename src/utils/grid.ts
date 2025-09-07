export type GridItem = {
  row_index?: number | null;
  col_index?: number | null;
  row_span?: number | null;
  col_span?: number | null;
};

export function hasCollisions(items: GridItem[]): boolean {
  type Rect = { r1: number; c1: number; r2: number; c2: number };
  const rects: Rect[] = items.map((it) => {
    const r = (it.row_index ?? 0) | 0;
    const c = (it.col_index ?? 0) | 0;
    const rs = Math.max(1, (it.row_span ?? 1) | 0);
    const cs = Math.max(1, (it.col_span ?? 1) | 0);
    return { r1: r, c1: c, r2: r + rs - 1, c2: c + cs - 1 };
  });
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i]!;
      const b = rects[j]!;
      const overlap = !(
        a.r2 < b.r1 ||
        b.r2 < a.r1 ||
        a.c2 < b.c1 ||
        b.c2 < a.c1
      );
      if (overlap) return true;
    }
  }
  return false;
}

export default hasCollisions;
