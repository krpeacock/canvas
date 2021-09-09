import { canvas_backend } from "../../declarations/canvas_backend";
import { Position } from "../../declarations/canvas_backend/canvas_backend.did";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`could not parse hex ${hex}`);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

const TILE_SIZE = 64;
const ROW_LENGTH = 16;

export const getTileAndRelativePosition = (absolutePosition: Position) => {
  let get_tile_idx = (position: Position) => {
    return (
      Math.floor(position.x / TILE_SIZE) +
      Math.floor(position.y / TILE_SIZE) * ROW_LENGTH
    );
  };
  let tileIdx = get_tile_idx({
    x: absolutePosition.x,
    y: absolutePosition.y,
  });
  let relX = absolutePosition.x % TILE_SIZE;
  let relY = absolutePosition.y % TILE_SIZE;
  let relativePosition: Position = { x: relX, y: relY };
  return { relativePosition, tileIdx };
};

function getXY(tileIdx: number) {
  let x = 0;
  let y = 0;
  let complete = false;
  for (let i = 0; i < ROW_LENGTH; i++) {
    for (let j = 0; j < ROW_LENGTH; j++) {
      if (tileIdx === j + i) {
        complete = true;
        break;
      }
      x += TILE_SIZE;
    }
    if (complete) break;
    y += TILE_SIZE;
  }
  return { x, y };
}

export const refreshTile = async (tileIdx: number) => {
  const { x, y } = getXY(tileIdx);

  const hiddenContainer = document.createElement("div");
  hiddenContainer.style.display = "none";

  const src =
    process.env.NODE_ENV === "development"
      ? `http://localhost:8000/tile.${tileIdx}.png?canisterId=${process.env.CANVAS_BACKEND_CANISTER_ID}`
      : `https://${process.env.CANVAS_BACKEND_CANISTER_ID}.ic0.app/tile.${tileIdx}.png`;
  const img = document.createElement("img");

  img.src = src;
  const loadPromise = new Promise<void>((resolve) => {
    img.addEventListener("load", (e) => {
      const canvas1 = document.getElementById("canvas1") as HTMLCanvasElement;
      const ctx = canvas1.getContext("2d");
      console.log(ctx, img);
      console.log(tileIdx, { x, y });
      ctx?.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);

      resolve();
    });
  });
  hiddenContainer.appendChild(img);
  document.body.appendChild(hiddenContainer);

  await loadPromise;
  console.log("successfully refreshed canvas");
};
