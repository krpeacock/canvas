import {
  AlertDialog,
  Button,
  Content,
  DialogTrigger,
  Divider,
  Flex,
  Heading,
  View,
} from "@adobe/react-spectrum";
import React from "react";
import { useState } from "react";
import { useContext } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import { AppContext } from "./App";
import {
  Position,
} from "../../declarations/canvas_backend/canvas_backend.did";
import { getTileAndRelativePosition, refreshTile } from "./utils";

const Box = styled.div<{ background: string }>`
  height: 32px;
  width: 32px;
  border: 2px solid white;
  background: ${(props) => props.background};
`;

function Submit(props: { handleDrop: any; renderCanvas2: any }) {
  const { handleDrop, renderCanvas2 } = props;
  const [isLocked, setIsLocked] = useState(false);

  const { absolutePosition, color, actor } = useContext(AppContext);
  const submit = async () => {
    if (!absolutePosition || !color || !actor) {
      throw new Error("Requires a position and color");
    }

    setIsLocked(true);
    toast("Submitting your pixel");
    const { tileIdx, relativePosition } =
      getTileAndRelativePosition(absolutePosition);
    console.log(color);
    actor
      .update_pixel(tileIdx, relativePosition, { ...color, a: 255 })
      .then(async () => {
        toast.success("Submitted! You can play again in 30 seconds");
        await refreshTile(tileIdx);
        handleDrop();
        renderCanvas2();
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          "There was a problem submitting your pixel. Make sure you have logged in and have waited 30 seconds since your last submission!"
        );
      })
      .finally(() => {
        window.setTimeout(() => {
          setIsLocked(false);
          toast("Ready to submit again!");
        }, 30000);
      });
  };
  const formattedColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${255})`;

  return (
    <DialogTrigger>
      <Button variant="cta" type="submit" isDisabled={isLocked}>
        Submit
      </Button>
      {(close) => {
        return (
          <AlertDialog
            title="Submit your pixel!"
            primaryActionLabel="Submit"
            onPrimaryAction={submit}
            cancelLabel="cancel"
            width="size-500"
          >
            <Content>
              <p>Ready to go? Your change is:</p>
              <Divider></Divider>
              <dl>
                <dt>Pixel:</dt>
                <dd>{`{ x: ${absolutePosition.x}, y: ${absolutePosition.y} }`}</dd>
                <dt>Color</dt>
                <dd>
                  <Flex direction="row">
                    <span>{formattedColor}</span>
                    <Box background={formattedColor} />
                  </Flex>
                </dd>
              </dl>
            </Content>
          </AlertDialog>
        );
      }}
    </DialogTrigger>
  );
}

export default Submit;
