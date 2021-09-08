import React, {
  createRef,
  MouseEventHandler,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import styled from "styled-components";
import Draggable from "react-draggable";
import assert from "assert";
import { Color, ColorResult, RGBColor, SketchPicker } from "react-color";

const StyledPicture = styled.picture`
  width: 100%;
  display: flex;
  flex-direction: column;
  position: static;
  /* height: 300px;
  width: 300px;
  @media (min-width: 767px) {
    height: 500px;
    width: 500px;
  }
  @media (min-width: 1080px) {
    height: 0px;
    width: 0px;
  } */

  img {
    display: flex;
    margin: 0;
    max-width: calc(100vw - 32px);
    max-height: calc(100vw - 32px);
  }
`;

const DragArea = styled.section<{ tileSize: string }>`
  --tileSize: ${(props) => props.tileSize};
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 0;
  width: 100%;
  max-width: 100%;
  margin-bottom: 1rem;

  #selection {
    position: absolute;
    top: 0;
    left: 0;
    height: var(--tileSize);
    width: var(--tileSize);
    background: rgb(237, 30, 121);
  }
`;

const Wrapper = styled.div`
  canvas {
    /* height: var(--canvas-size);
    width: var(--canvas-size); */
    background: white;
  }

  .dragarea {
    max-height: calc(100vw - 2rem);
    max-width: calc(100vw - 2rem);
    overflow: scroll;
  }

  #canvas2 {
    transform: scale(calc(1+ ((100vw - 256px) / 100vw)));
  }

  #fullsize {
    visibility: hidden;
    position: fixed;
    z-index: -1;
    height: 1px;
    width: 1px;
    overflow: scroll;
  }
`;

const SubView = styled.section`
  margin: 1rem 0;
  max-width: calc(100vw - 3rem);
  position: relative;
  canvas {
  }
  #pixelWrapper {
    position: absolute;
    left: -18px;
    top: -18px;
    padding: 16px;
    border: 1px solid black;
    background: transparent;
    &:active {
      background: rgba(255, 255, 255, 0.25);
    }
    border-radius: 100%;

    #pixel {
      width: 4px;
      height: 4px;
      @media (min-width: 600px) {
        width: 8px;
        height: 8px;
      }
    }
    .pickerContainer {
      position: relative;
      @media (min-width: 600px) {
        top: 4px;
        left: 12px;
      }
    }
  }
`;

interface Props {}
function PictureDrag(props: Props) {
  const {} = props;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [totalSize, setTotalSize] = useState(0);
  const [interval, saveInterval] = useState(0);
  const [canvasSize, setCanvasSize] = useState(100);
  const [canvas2Scale, setCanvas2Scale] = useState(1);
  const [color, setColor] = useState<ColorResult["rgb"]>({
    r: 34,
    g: 25,
    b: 77,
    a: 100,
  });
  const imgRef = createRef<HTMLImageElement>();

  const blink = () => {
    const dragBox = document.getElementById("selection");
    const current = dragBox?.style.background;
    const next =
      current === "rgb(237, 30, 121)"
        ? "rgb(82, 39, 133)"
        : "rgb(237, 30, 121)";
    dragBox?.style.setProperty("background", next);
  };

  const setupInterval = () => {
    const interval = window.setInterval(blink, 600);
    saveInterval(interval);
    return interval;
  };

  useLayoutEffect(() => {
    if (window.innerWidth < 600) {
      setCanvas2Scale(1);
    } else {
      setCanvas2Scale(2);
    }
  }, [window.innerWidth]);

  useEffect(() => {
    const i = setupInterval();
    return clearInterval(i);
  }, []);

  function onImgLoad(e: any) {
    const fullsize = document.querySelector("#fullsize img") as
      | HTMLImageElement
      | undefined;
    if (fullsize) {
      const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
      canvas.width = fullsize.naturalWidth;
      canvas.height = fullsize.naturalWidth;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      const imgSize = e.target.getBoundingClientRect().width;
      setCanvasSize(imgSize);
      ctx.drawImage(fullsize, 0, 0);
      setTotalSize(fullsize.naturalWidth);
    }
  }

  function handleDrop(e: any) {
    const selection = document.querySelector("#selection") as HTMLDivElement;
    assert(selection);

    const [x, y] = selection.style.transform
      .slice(10, selection.style.transform.length - 1)
      .split(", ")
      .map((substr) => Number(substr.split("px")[0]));

    totalSize;
    canvasSize;

    setPosition({ y, x });
  }

  function handlePixel(e: any) {
    const pixel = document.querySelector("#pixelWrapper") as HTMLButtonElement;
    assert(pixel);

    const [x = 0, y = 0] = pixel.style.transform
      .slice(10, pixel.style.transform.length - 1)
      .split(", ")
      .map((substr) => Number(substr.split("px")[0]));

    const absoluteX = x / canvas2Scale / 4 + position.x;
    const absoluteY = y / canvas2Scale / 4 + position.y;
    console.log("pixel coordinates:", `${absoluteX}, ${absoluteY}`);
  }

  useEffect(() => {
    const fullsize = document.querySelector("#fullsize img") as
      | HTMLImageElement
      | undefined;
    if (fullsize) {
      const canvas = document.getElementById("canvas2") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      totalSize;
      ctx.drawImage(
        fullsize,
        position.x,
        position.y,
        64,
        64,
        0,
        0,
        256 * canvas2Scale,
        256 * canvas2Scale
      );
    }
  }, [position]);

  const clickCapture = () => {};

  return (
    <Wrapper>
      <div id="fullsize">
        <img
          src="/example.png"
          alt="example"
          ref={imgRef}
          onLoad={onImgLoad}
          height={totalSize}
          width={totalSize}
          style={{
            maxWidth: `${totalSize}px`,
            maxHeight: `${totalSize}px`,
          }}
        />
      </div>
      <DragArea tileSize={`${64}px`} className="dragarea">
        <canvas id="canvas1"></canvas>
        <Draggable
          grid={[4 * canvas2Scale, 4 * canvas2Scale]}
          bounds={{
            left: 0,
            top: 0,
            right: totalSize - 64,
            bottom: totalSize - 64,
          }}
          onStop={handleDrop}
        >
          <div id="selection"></div>
        </Draggable>
      </DragArea>
      <SubView>
        <canvas
          id="canvas2"
          width={256 * canvas2Scale}
          height={256 * canvas2Scale}
          onClick={clickCapture}
        />
        <Draggable
          grid={[4 * canvas2Scale, 4 * canvas2Scale]}
          bounds={{
            left: 0,
            top: 0,
            bottom: 256 * canvas2Scale - 8,
            right: 256 * canvas2Scale - 8,
          }}
          onStop={handlePixel}
        >
          <button id="pixelWrapper" type="button">
            <div
              id="pixel"
              style={{
                background: color
                  ? `rgba(${color.r},${color.g},${color.b},${color.a})`
                  : "white",
              }}
            ></div>
          </button>
        </Draggable>
      </SubView>
      <div className="pickerContainer">
        <SketchPicker
          color={color}
          onChange={(color) => {
            setColor(color.rgb);
          }}
        ></SketchPicker>
      </div>
    </Wrapper>
  );
}

export default PictureDrag;
