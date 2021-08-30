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
} from "@adobe/react-spectrum";
import { parseColor } from "@react-stately/color";
import { ColorSlider, ColorWheel } from "@react-spectrum/color";
import { clear, get, set } from "local-storage";
import Submit from "./Submit";

interface Props {}

function App(props: Props) {
  const [latest, setLatest] = React.useState<Image>();
  const [canvasState, setCanvasState] = React.useState<Image>();
  const [ctx, setCtx] = React.useState<CanvasRenderingContext2D>();
  const [color, setColor] = React.useState(parseColor("hsl(0, 100%, 50%))"));
  const [brushSize, setBrushSize] = React.useState(5);
  const canvasRef = createRef<HTMLCanvasElement>();

  const setIsMousePressed = (value: boolean) =>
    ((globalThis as any).isMousePressed = value);

  useEffect(() => {
    const saved = get("draft");
    if (saved) {
      setLatest(JSON.parse(saved as string));
    } else {
      canvas.latest().then((image) => setLatest(image));
    }
  }, []);

  useEffect(() => {
    if (canvasRef.current && latest) {
      renderCanvas(canvasRef.current, latest);
      setCtx(canvasRef.current.getContext("2d") as CanvasRenderingContext2D);
    }
  }, [latest, canvasRef.current]);

  useEffect(() => {
    if (ctx) {
      // rebind listener
      canvasRef.current?.removeEventListener("mousemove", handleMouseOver);

      canvasRef.current?.addEventListener("mousemove", handleMouseOver);
    }
  }, [ctx, color, brushSize]);

  const handleMouseOver = (e: any) => {
    if (!ctx || !(globalThis as any).isMousePressed) return;
    const halfBrushSize = brushSize / 2;
    try {
      for (let i = -1 * halfBrushSize; i < halfBrushSize; i++) {
        for (let j = -1 * halfBrushSize; j < halfBrushSize; j++) {
          try {
            setPixel(ctx, e.layerX + j, e.layerY + i, color.toString("hsl"));
          } catch (error) {}
        }
      }

      setPixel(ctx, e.layerX, e.layerY, color.toString("hsl"));
      if (!latest || !canvasRef.current || !ctx) return;
    } catch (error) {
      console.log(error);
    }
  };

  const saveDraft = () => {
    if (!ctx) {
      throw new Error("context is not defined");
    }
    const image = extractImage(ctx);

    set("draft", JSON.stringify(image));
  };

  const clearChanges = () => {
    clear();
    canvas.latest().then((image) => setLatest(image));
  };

  return (
    <Provider theme={defaultTheme}>
      <main
        onMouseDown={() => setIsMousePressed(true)}
        onMouseUp={() => setIsMousePressed(false)}
      >
        <Flex direction="column" justifyContent="center" alignItems="center">
          <h1>IC Canvas</h1>
          <p>
            Leave your mark on this piece of internet history. Update as many
            pixels as you want, and your version of the canvas will join the
            timeline.
          </p>
          <Flex
            direction="row"
            wrap="wrap"
            justifyContent="start"
            alignItems="end"
          >
            <figure>
              <canvas id="canvas" width="400" height="400" ref={canvasRef} />
              <figcaption>latest state of the canvas</figcaption>
            </figure>
            <Flex direction="column" marginBottom="2rem">
              <ColorWheel
                onChange={(value) => setColor(value.toFormat("hsl"))}
              />
              <Slider
                label="Brush size"
                minValue={1}
                maxValue={30}
                value={brushSize}
                onChange={(v) => setBrushSize(v)}
              />
            </Flex>
          </Flex>
          <Content>
            <ButtonGroup align="start" justifySelf="start">
              <Button type="button" variant="secondary" onPress={saveDraft}>
                Save Draft
              </Button>
              <Button type="reset" variant="secondary" onPress={clearChanges}>
                Clear changes
              </Button>
            </ButtonGroup>
          </Content>
        </Flex>
        <Submit ctx={ctx} latest={latest} />
      </main>
    </Provider>
  );
}

export default App;
