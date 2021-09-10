import { getXY } from "./utils";

describe("getXY mapping from tile", () => {
  test("Tile 0", () => {
    const foo = getXY(0);
    expect(foo).toEqual({ x: 0, y: 0 });
  });
  test.only("Tile 15", () => {
    const foo = getXY(15);
    expect(foo).toEqual({ x: 960, y: 0 });
  });
  test.only("Tile 16", () => {
    const foo = getXY(16);
    expect(foo).toEqual({ x: 0, y: 64 });
  });
  test.only("Tile 240", () => {
    const foo = getXY(240);
    expect(foo).toEqual({ y: 960, x: 0 });
  });
  test.only("Tile 255", () => {
    const foo = getXY(255);
    expect(foo).toEqual({ x: 960, y: 960 });
  });
});
