import {
  AlertDialog,
  Button,
  Content,
  DialogTrigger,
  Divider,
  Flex,
  Heading,
  View,
  Text,
} from "@adobe/react-spectrum";
import React from "react";
import { useState } from "react";
import { useContext } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import { AppContext } from "./App";
import { Position } from "../../declarations/canvas_backend/canvas_backend.did";
import { getTileAndRelativePosition, refreshTile } from "./utils";

export const Box = styled.div<{ background: string }>`
  height: 32px;
  width: 32px;
  border: 2px solid white;
  background: ${(props) => props.background};
`;

function Submit(props: { handleDrop: any; renderCanvas2: any }) {
  const { handleDrop, renderCanvas2 } = props;
  const [isLocked, setIsLocked] = useState(false);

  const { pixels, setPixels, actor, isAuthenticated } = useContext(AppContext);
  const submit = async () => {
    if (!pixels || !actor) {
      throw new Error("Requires at least one pixel");
    }

    setIsLocked(true);
    toast("Submitting your pixel");
    actor
      .update_pixels(pixels)
      .then(async () => {
        toast.success("Submitted! You can play again in 30 seconds");

        new Set(pixels.map((pixel) => pixel.tile_idx)).forEach(async (tile) => {
          refreshTile(tile);
        });
        setPixels?.([]);
        window.setTimeout(() => {
          handleDrop();
          renderCanvas2();
        }, 1000);
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
            isPrimaryActionDisabled={!isAuthenticated}
            width="size-500"
          >
            <Content>
              <p>Ready to go? Your changes are:</p>
              <Divider></Divider>
              <dl>
                {pixels.map((pixel) => {
                  const { r, g, b } = pixel.color;
                  const formattedColor = `rgba(${r}, ${g}, ${b}, ${255})`;
                  <>
                    <dt>Coordinates:</dt>
                    <dd>{`{ x: ${pixel.pos.x}, y: ${pixel.pos.y} }`}</dd>
                    <dt>Color</dt>
                    <dd>
                      <Flex direction="row">
                        <span>{formattedColor}</span>
                        <Box background={formattedColor} />
                      </Flex>
                    </dd>
                  </>;
                })}
              </dl>
              {!isAuthenticated ? (
                <View backgroundColor="red-400">
                  <Text width="100%">
                    <p style={{ padding: "0.5rem" }}>
                      You are not logged in. <br />
                      Please log in to submit!
                      <Button
                        variant="cta"
                        onPress={() => {
                          document.getElementById("loginButton")?.click();
                          close();
                        }}
                      >
                        Log In
                      </Button>
                    </p>
                  </Text>
                </View>
              ) : null}
            </Content>
          </AlertDialog>
        );
      }}
    </DialogTrigger>
  );
}

export default Submit;
