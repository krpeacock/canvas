import { canvas } from "../../declarations/canvas";
import { Image } from "../../declarations/canvas/canvas.did";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`could not parse hex ${hex}`);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function setPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number
) {
  ctx.fillStyle = `rgb( ${r} , ${g} , ${b} )`;
  ctx.fillRect(x, y, 1, 1);
}

const renderCanvas = (image: Image) => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  image.forEach((array, i) => {
    array.forEach((hex, j) => {
      const { r, g, b } = hexToRgb(hex);
      setPixel(ctx, j, i, r, g, b);
    });
  });
};

const init = async () => {
  const latest = await canvas.latest();
  renderCanvas(latest);
};
init();
