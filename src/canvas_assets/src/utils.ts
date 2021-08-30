import { canvas } from "../../declarations/canvas";
import { Image } from "../../declarations/canvas/canvas.did";

let latest: Image;
type ButtonState = {
  prevFill: string;
  newFill: string;
  button: HTMLButtonElement;
};

type Edit = {
  fill: string;
  divs: [ButtonState];
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`could not parse hex ${hex}`);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export function setPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillStyle: CanvasFillStrokeStyles["fillStyle"]
) {
  ctx.fillStyle = fillStyle;
  ctx.fillRect(x, y, 1, 1);
}

type Diff = {
  x: number;
  y: number;
  oldValue: string;
  newValue: string;
};
export const compareImages = (oldImage: Image, newImage: Image) => {
  let diffs: Diff[] = [];
  newImage.forEach((row, y) => {
    row.forEach((newValue, x) => {
      const oldValue = oldImage[y][x];
      if (newValue !== oldImage[y][x]) {
        diffs.push({
          x,
          y,
          newValue,
          oldValue,
        });
      }
    });
  });
  return diffs;
};

export const extractImage = (ctx: CanvasRenderingContext2D) => {
  const image: Image = [];
  for (let i = 0; i < 400; i++) {
    const row = [];
    for (let j = 0; j < 400; j++) {
      let data = ctx?.getImageData(j, i, 1, 1)?.data;
      if (!data) continue;
      const rgb = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
      row.push(rgb);
    }
    image.push(row);
  }
  return image;
};

export const renderCanvas = (canvas: HTMLCanvasElement, image: Image) => {
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  image.forEach((array, i) => {
    array.forEach((value, j) => {
      let fillStyle = value;
      if (value.includes("#")) {
        const { r, g, b } = hexToRgb(value);
        fillStyle = `rgb(${r},${g},${b})`;
      }
      setPixel(ctx, j, i, fillStyle);
    });
  });
};

const renderGrid = async () => {
  const grid = document.getElementById("grid");
  for (let i = 0; i < 200; i++) {
    for (let j = 0; j < 200; j++) {
      const button = document.createElement("button");
      button.id = `${i}-${j}`;
      button.dataset.y = i.toString();
      button.dataset.x = j.toString();
      button.style.setProperty("height", "1px");
      button.style.setProperty("width", "1px");
      button.style.setProperty("background-color", latest[i][j]);

      grid?.appendChild(button);
    }
  }
};
