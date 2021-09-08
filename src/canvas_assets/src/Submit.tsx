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

const Box = styled.div<{ background: string }>`
  height: 32px;
  width: 32px;
  border: 2px solid white;
  background: ${(props) => props.background};
`;

const TILE_SIZE = 64;
const ROW_LENGTH = 16;

function Submit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { absolutePosition, color, actor } = useContext(AppContext);
  const submit = async () => {
    if (!absolutePosition || !color || !actor) {
      throw new Error("Requires a position and color");
    }

    setIsSubmitting(true);
    toast("Submitting your pixel");
    let get_tile_idx = (x, y) => {
      return Math.floor(x / TILE_SIZE) + Math.floor(y / TILE_SIZE) * ROW_LENGTH;
    };
    let tileIdx = get_tile_idx(absolutePosition.x, absolutePosition.y);
    let relX = absolutePosition.x % TILE_SIZE;
    let relY = absolutePosition.y % TILE_SIZE;
    let relativePosition: Position = {x: relX, y: relY};
    actor
      .update_pixel(tileIdx, relativePosition, color)
      .then(() => {
        toast.success("Submitted! You can play again in 30 seconds");
      })
      .catch((err) => {
        console.error(err);
        toast.error("There was a problem submitting your pixel");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  const formattedColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;

  return (
    <DialogTrigger>
      <Button variant="cta" type="submit">
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
