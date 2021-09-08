import {
  ActionButton,
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogTrigger,
  Divider,
  Flex,
  Header,
  Heading,
  Text,
} from "@adobe/react-spectrum";
import React, { useEffect } from "react";
import { canisterId } from "../../declarations/canvas_backend";
import {
  Color,
  Position,
} from "../../declarations/canvas_backend/canvas_backend.did";
import { useAuthClient } from "./hooks";

interface Props {
  position?: Position;
  color?: Color;
}

function Submit(props: Props) {
  const { position, color } = props;
  const { actor } = useAuthClient();
  const submit = () => {
    if (!position || !color) {
      throw new Error("Requires a position and color");
    }
    // TODO: calculate the tile and relative position from the coordinates
    actor?.update_pixel(0, position, color);
  };

  return (
    <DialogTrigger>
      <Flex marginStart="2rem">
        <Button variant="cta" type="submit">
          Submit
        </Button>
      </Flex>
      {(close) => {
        return (
          <Dialog>
            <Heading>Submit your pixel!</Heading>
            <Divider />
            <Button variant="cta" type="submit" onPress={submit}>
              Submit
            </Button>
          </Dialog>
        );
      }}
    </DialogTrigger>
  );
}

export default Submit;
