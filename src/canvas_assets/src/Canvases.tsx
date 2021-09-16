import React, { createRef, useEffect, useLayoutEffect, useState } from "react";
import styled from "styled-components";
import Draggable from "react-draggable";
import assert from "assert";
import { ColorResult, SketchPicker } from "react-color";
import { Flex, Heading, View, Text } from "@adobe/react-spectrum";
import { useContext } from "react";
import { AppContext } from "./App";
import { Position, Focus, FOCUS_SIZE } from "./tiles";
import Submit from "./Submit";

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
`;

export const canvasSize = 1024;

interface Props {}
function Canvases(props: Props) {
  const {} = props;
  const [canvas2Scale, setCanvas2Scale] = useState(1);
  const imgRef = createRef<HTMLImageElement>();

  const {
    position,
    setPosition,
    absolutePosition,
    setAbsolutePosition,
    color,
    setColor,
  } = useContext(AppContext);

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

    const relativePosition = {
      x: absolutePosition.x - position.x,
      y: absolutePosition.y - position.y,
    };

    const [x, y] = selection.style.transform
      .slice(10, selection.style.transform.length - 1)
      .split(", ")
      .map((substr) => Number(substr.split("px")[0]));

    setPosition?.({ x, y });
    setAbsolutePosition?.({
      x: x + relativePosition.x,
      y: y + relativePosition.y,
    });
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
    setAbsolutePosition?.({ x: absoluteX, y: absoluteY });
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
              bottom: 256 * canvas2Scale - 3 * canvas2Scale,
              right: 256 * canvas2Scale - 3 * canvas2Scale,
            }}
            defaultPosition={{
              x: canvas2Scale === 1 ? 128 : canvas2Scale * 256,
              y: canvas2Scale === 1 ? 128 : canvas2Scale * 256,
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
        <View
          id="pickerContainer"
          backgroundColor="static-white"
          padding="1rem"
        >
          <Flex direction={canvas2Scale === 1 ? "column-reverse" : "column"}>
            <div>
              <Heading level={3}>
                <span style={{ color: "black" }}>Coordinates</span>
              </Heading>
              <p style={{ color: "black" }} key={position.x + position.y}>
                <code>{JSON.stringify(absolutePosition)}</code>
              </p>
            </div>
            <SketchPicker
              color={color}
              disableAlpha
              onChange={(color) => {
                // map from percent to u8 byte value
                const aValue = color.rgb.a ? color.rgb.a : 255;
                setColor?.({ ...color.rgb, a: aValue });
              }}
            ></SketchPicker>
            <p style={{ color: "black", maxWidth: "400px" }}>
              Use the Color Selector to choose the color for your pixel, and
              drag the cursor to your chosen location. Press Submit When you are
              ready!
            </p>
            <Submit handleDrop={handleDrop} renderCanvas2={renderCanvas2} />
          </Flex>
        </View>
      </Flex>
    </Wrapper>
  );
}

export default Canvases;
