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
import Submit from "./Submit";

interface Props {}

function App(props: Props) {
  const [latest, setLatest] = React.useState<Image>();
  const [isModified, setIsModified] = React.useState(false);
  const [canvasState, setCanvasState] = React.useState<Image>();
  const [ctx, setCtx] = React.useState<CanvasRenderingContext2D>();
  const [color, setColor] = React.useState(parseColor("hsl(0, 100%, 50%))"));
  const [brushSize, setBrushSize] = React.useState(5);
  const canvasRef = createRef<HTMLCanvasElement>();

  const setIsMousePressed = (value: boolean) =>
    ((globalThis as any).isMousePressed = value);

  useEffect(() => {
    canvas.latest().then((image) => setLatest(image));
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

  const handleImageInput = (e: any) => {
    const selectedFile = e.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = function (e) {
      if (ctx) {
        const img = document.createElement("img");
        img.setAttribute("src", reader.result as string);
        img.style.setProperty("display", "none");
        img.setAttribute("width", "400");
        img.setAttribute("height", "400");
        document.body.append(img);
        img.addEventListener("load", (e) => {
          ctx.drawImage(img, 0, 0);
          document.body.removeChild(img);
          setIsModified(true);
        });
      } else throw new Error("context not available");
    };
  };

  const handleMouseOver = (e: any) => {
    if (!ctx || !(globalThis as any).isMousePressed) return;
    setIsModified(true);
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
    console.log(image);
    set("draft", JSON.stringify(image));
  };

  const loadDraft = () => {
    const draft = get("draft") as string;
    if (draft && canvasRef.current) {
      const image = JSON.parse(draft) as Image;
      setCanvasState(image);
      renderCanvas(canvasRef.current, image);
    }
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
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="start"
          marginBottom="4rem"
          margin="2rem"
        >
          <h1>IC Canvas</h1>
          <p>
            Leave your mark on this piece of internet history. Update as many
            pixels as you want, and your version of the canvas will join the
            timeline. This 400 x 400 pixel canvas is yours to modify. Draw on
            the canvas using the in-page tool, or save the image, make changes
            in your favorite image editor, and upload using the Load a custom
            image button! (This is my personal recommendation, most image
            editing tools weren't written in a weekend)
          </p>
          <p>
            You will be charged for your changes according to the number of
            pixels you choose to modify. Right now, the UI is just the MVP for
            this concept, but check out the roadmap for future plans, like NFT
            minting and some interesting ways to view the progression of the
            canvas over time!
          </p>
          <Flex
            direction="row"
            wrap="wrap"
            justifyContent="start"
            alignItems="end"
            gap="3rem"
          >
            <figure>
              <canvas id="canvas" width="400" height="400" ref={canvasRef} />
              <figcaption>
                {isModified ? "edited" : "latest state of the canvas"}
              </figcaption>
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
              <Button
                variant="cta"
                type="button"
                onPress={() => {
                  (
                    document.querySelector("#file-upload") as HTMLInputElement
                  ).click();
                }}
              >
                <Text>Load a custom image!</Text>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageInput}
                  style={{ display: "none" }}
                />
              </Button>
            </Flex>
          </Flex>
          <ButtonGroup align="start" justifySelf="start">
            <Button
              type="button"
              variant="secondary"
              onPress={saveDraft}
              isDisabled={!isModified}
            >
              Save Draft
            </Button>
            <Button type="button" variant="secondary" onPress={loadDraft}>
              Load Draft
            </Button>
            <Button
              type="reset"
              variant="secondary"
              onPress={clearChanges}
              isDisabled={!isModified}
            >
              Clear changes
            </Button>
          </ButtonGroup>
        </Flex>
        <Submit ctx={ctx} latest={latest} isModified={isModified} />
      </main>
    </Provider>
  );
}

export default App;
