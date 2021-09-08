import React, { createRef, useEffect } from "react";
import { canvas } from "../../declarations/canvas";
import { Image } from "../../declarations/canvas/canvas.did";
import { extractImage, renderCanvas, setPixel } from "./utils";
import {
  Provider,
  defaultTheme,
  Button,
  Flex,
  Slider,
  ButtonGroup,
  Content,
  Text,
} from "@adobe/react-spectrum";
import { parseColor } from "@react-stately/color";
import { ColorSlider, ColorWheel } from "@react-spectrum/color";
import { clear, get, set } from "local-storage";
import styled from "styled-components";
import Submit from "./Submit";
import PictureDrag from "./PictureDrag";

interface Props {}

function App(props: Props) {
  const [latest, setLatest] = React.useState<Image>();
  const [isModified, setIsModified] = React.useState(false);
  const [canvasState, setCanvasState] = React.useState<Image>();
  const [ctx, setCtx] = React.useState<CanvasRenderingContext2D>();
  const [color, setColor] = React.useState(parseColor("hsl(0, 100%, 50%))"));
  const [brushSize, setBrushSize] = React.useState(5);
  const canvasRef = createRef<HTMLCanvasElement>();
  return (
    <Provider theme={defaultTheme}>
      <main>
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="start"
          marginBottom="4rem"
          margin="4px"
        >
          <h1>Canvas #1</h1>
          <Flex
            direction="column"
            wrap="wrap"
            justifyContent="start"
            alignItems="end"
            gap="3rem"
          >
            <PictureDrag />
          </Flex>
        </Flex>
        <Submit ctx={ctx} latest={latest} isModified={isModified} />
      </main>
    </Provider>
  );
}

export default App;
