import React, { createRef, useEffect, useLayoutEffect, useState } from "react";
import styled from "styled-components";
import Draggable from "react-draggable";
import assert from "assert";
import { ColorResult, SketchPicker } from "react-color";
import { Flex, Heading, View, Text } from "@adobe/react-spectrum";
import { useContext } from "react";
import { AppContext } from "./App";
import { Position, Focus, FOCUS_SIZE } from "./tiles";
import Submit, { Box } from "./Submit";
import toast from "react-hot-toast";
import { getAbsoluteFromRelative, getTileAndRelativePosition } from "./utils";

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
    @keyframes glowing {
      0% {
        background-color: rgb(237, 30, 121);
        box-shadow: 0 0 3px rgb(237, 30, 121);
      }
      50% {
        background-color: rgb(82, 39, 133);
        box-shadow: 0 0 10px rgb(82, 39, 133);
      }
      100% {
        background-color: rgb(237, 30, 121);
        box-shadow: 0 0 3px rgb(237, 30, 121);
      }
    }
    animation: glowing 1300ms infinite step-end;
  }
`;

const Wrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 1rem;
  canvas {
    /* height: var(--canvas-size);
    width: var(--canvas-size); */
    background: white;
  }

  .dragarea {
    width: auto;
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
    img {
      height: 1024px;
      width: 1024px;
    }
  }
`;

const SubView = styled.section`
  margin: 0;
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
    animation: pulse 1300ms infinite step-end;
    @keyframes pulse {
      0% {
        background-color: rgba(237, 30, 121, 0.15);
        box-shadow: 0 0 3px rgba(237, 30, 121, 1);
        border: 1px solid rgba(237, 30, 121, 1);
      }
      50% {
        background-color: rgba(82, 39, 133, 0.15);
        box-shadow: 0 0 10px rgba(82, 39, 133, 1);
        border: 1px solid rgba(82, 39, 133, 1);
      }
      100% {
        background-color: rgba(237, 30, 121, 0.15);
        box-shadow: 0 0 3px rgba(237, 30, 121, 1);
        border: 1px solid rgba(237, 30, 121, 1);
      }
    }

    #pixel {
      width: 4px;
      height: 4px;
      @media (min-width: 600px) {
        width: 8px;
        height: 8px;
      }
    }
    #pickerContainer {
      position: relative;
      @media (min-width: 600px) {
        top: 4px;
        left: 12px;
      }
    }
    .sketch-picker {
      margin-left: 1rem;
    }
  }
  li {
    text-decoration: none;
    list-style: none;
  }
`;

interface Props {}
function Canvases(props: Props) {
  const canvasSize = 1024;
  const {} = props;
  const [canvas2Scale, setCanvas2Scale] = useState(1);
  const imgRef = createRef<HTMLImageElement>();

  const { position, setPosition, pixels, setPixels, color, setColor } =
    useContext(AppContext);

  useLayoutEffect(() => {
    if (window.innerWidth < 600) {
      setCanvas2Scale(1);
    } else {
      setCanvas2Scale(2);
    }
  }, [window.innerWidth]);

  function onImgLoad(e: any) {
    const fullsize = document.querySelector("#fullsize img") as
      | HTMLImageElement
      | undefined;
    if (fullsize) {
      const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.drawImage(fullsize, 0, 0);
      handleDrop();
    }
  }

  function handleDrop() {
    const selection = document.querySelector("#selection") as HTMLDivElement;
    assert(selection);

    const [x, y] = selection.style.transform
      .slice(10, selection.style.transform.length - 1)
      .split(", ")
      .map((substr) => Number(substr.split("px")[0]));

    setPosition?.({ y, x });
  }

  function handleClick(e: React.MouseEvent) {
    let focus = new Focus(
      new Position(
        e.nativeEvent.offsetX - FOCUS_SIZE / canvas2Scale,
        e.nativeEvent.offsetY - FOCUS_SIZE / canvas2Scale
      )
    );
    setPosition?.({ x: focus.position.x, y: focus.position.y });
  }

  function handlePixel(e: any) {
    const pixel = document.querySelector("#pixelWrapper") as HTMLButtonElement;
    assert(pixel);

    const [x = 0, y = 0] = pixel.style.transform
      .slice(10, pixel.style.transform.length - 1)
      .split(", ")
      .map((substr) => Number(substr.split("px")[0]));

    const absoluteX = Math.ceil(x / canvas2Scale / 4 + position.x);
    const absoluteY = Math.ceil(y / canvas2Scale / 4 + position.y);
    const { tileIdx, relativePosition } = getTileAndRelativePosition({
      x: absoluteX,
      y: absoluteY,
    });

    if (pixels.length === 8) {
      toast.error("You may only submit up to 8 pixels at a time");
    } else {
      setPixels?.([
        ...pixels,
        { color, tile_idx: tileIdx, pos: relativePosition },
      ]);
    }
  }

  const renderCanvas2 = () => {
    const fullsize = document.querySelector("#fullsize img") as
      | HTMLImageElement
      | undefined;
    if (fullsize) {
      const canvas1 = document.getElementById("canvas1") as HTMLCanvasElement;

      const canvas = document.getElementById("canvas2") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.clearRect(0, 0, 256 * canvas2Scale, 256 * canvas2Scale);
      ctx.drawImage(
        canvas1,
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
  };

  useEffect(() => {
    renderCanvas2();
  }, [position]);

  const overviewImage =
    process.env.NODE_ENV === "development"
      ? `http://localhost:8000/overview.png?canisterId=${process.env.CANVAS_BACKEND_CANISTER_ID}`
      : `https://${process.env.CANVAS_BACKEND_CANISTER_ID}.raw.ic0.app/overview.png`;

  return (
    <Wrapper>
      <div id="fullsize">
        <img
          src={overviewImage}
          alt="example"
          ref={imgRef}
          onLoad={onImgLoad}
          style={{
            maxWidth: `${canvasSize}px`,
            maxHeight: `${canvasSize}px`,
          }}
        />
      </div>
      <DragArea tileSize={`${64}px`} className="dragarea">
        <canvas
          id="canvas1"
          onClick={handleClick}
          height={canvasSize}
          width={canvasSize}
        ></canvas>
        <Draggable
          grid={[4 * canvas2Scale, 4 * canvas2Scale]}
          position={{
            x: position.x,
            y: position.y,
          }}
          defaultPosition={{ x: canvasSize / 2, y: canvasSize / 2 }}
          bounds={{
            left: 0,
            top: 0,
            right: canvasSize - 64,
            bottom: canvasSize - 64,
          }}
          onStop={handleDrop}
        >
          <div id="selection"></div>
        </Draggable>
      </DragArea>
      <Flex wrap direction="row" gap="1rem">
        <SubView>
          <canvas
            id="canvas2"
            width={256 * canvas2Scale}
            height={256 * canvas2Scale}
          />
          <Draggable
            grid={[4 * canvas2Scale, 4 * canvas2Scale]}
            bounds={{
              left: 0,
              top: 0,
              bottom: 256 * canvas2Scale - 6,
              right: 256 * canvas2Scale - 6,
            }}
            defaultPosition={{ x: 256 * canvas2Scale, y: 256 * canvas2Scale }}
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
        <View
          id="pickerContainer"
          backgroundColor="static-white"
          padding="1rem"
        >
          <Flex direction="row" wrap>
            <SketchPicker
              color={color}
              disableAlpha
              onChange={(color) => {
                // map from percent to u8 byte value
                const aValue = color.rgb.a ? color.rgb.a : 255;
                setColor?.({ ...color.rgb, a: aValue });
              }}
            ></SketchPicker>
            <View>
              <Heading level={3}>
                <Text>Coordinates</Text>
              </Heading>
              <ul>
                {pixels.map((pixel, idx) => {
                  const { r, g, b } = pixel.color;
                  const formattedColor = `rgba(${r}, ${g}, ${b}, ${255})`;
                  const absolute = getAbsoluteFromRelative(
                    pixel.tile_idx,
                    pixel.pos
                  );
                  return (
                    <li>
                      <Flex direction="row">
                        <Box background={formattedColor} />
                        <Text>{JSON.stringify(absolute)}</Text>
                      </Flex>
                    </li>
                  );
                })}
              </ul>
            </View>
          </Flex>
          <p style={{ color: "black", maxWidth: "400px" }}>
            Use the Color Selector to choose the color for your pixel, and drag
            the cursor to your chosen location. Press Submit When you are ready!
          </p>
          <Submit handleDrop={handleDrop} renderCanvas2={renderCanvas2} />
        </View>
      </Flex>
    </Wrapper>
  );
}

export default Canvases;
