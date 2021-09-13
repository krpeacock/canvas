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
  Checkbox,
  CheckboxGroup,
} from "@adobe/react-spectrum";
import React from "react";
import { useState } from "react";
import { useContext } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import { AppContext } from "./App";
import { Position } from "../../declarations/canvas_backend/canvas_backend.did";
import { getTileAndRelativePosition, refreshTile } from "./utils";
import { get, set } from "local-storage";

const Box = styled.div<{ background: string }>`
  height: 32px;
  width: 32px;
  border: 2px solid white;
  background: ${(props) => props.background};
`;

function Submit(props: { handleDrop: any; renderCanvas2: any }) {
  const { handleDrop, renderCanvas2 } = props;
  const [isLocked, setIsLocked] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isConfirmDisabled, setIsConfirmDisabled] = useState<boolean>(
    !!get("isConfirmDisabled") ?? true
  );

  const { absolutePosition, color, actor, isAuthenticated, cooldown } =
    useContext(AppContext);

  const saveConfirmPreference = (preference: boolean) => {
    set("isConfirmDisabled", preference);
    setIsConfirmDisabled(preference);
  };

  const submit = async () => {
    if (!absolutePosition || !color || !actor) {
      throw new Error("Requires a position and color");
    }

    setIsLocked(true);
    toast("Submitting your pixel");
    const { tileIdx, relativePosition } =
      getTileAndRelativePosition(absolutePosition);
    actor
      .update_pixel(tileIdx, relativePosition, { ...color, a: 255 })
      .then(async () => {
        toast.success(`Submitted! You can play again in ${cooldown} seconds`);
        await refreshTile(tileIdx);
        handleDrop();
        renderCanvas2();
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          `There was a problem submitting your pixel. Make sure you have logged in and have waited ${30} seconds since your last submission!`
        );
      })
      .finally(() => {
        window.setTimeout(() => {
          setIsLocked(false);
          toast("Ready to submit again!");
        }, cooldown * 1000);
      });
  };
  const formattedColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${255})`;

  return (
    <DialogTrigger
      isOpen={dialogOpen}
      onOpenChange={(isOpen) => {
        if (isConfirmDisabled) setDialogOpen(false);
        else setDialogOpen(isOpen);
      }}
    >
      <Button
        variant="cta"
        type="submit"
        isDisabled={isLocked}
        onPress={() => {
          if (isConfirmDisabled) {
            submit();
          } else {
            setDialogOpen(true);
          }
        }}
      >
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
            isHidden={!isConfirmDisabled && !isAuthenticated}
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
            <Checkbox
              onChange={saveConfirmPreference}
              value={isConfirmDisabled.toString()}
            >
              Don't show this again
            </Checkbox>
          </AlertDialog>
        );
      }}
    </DialogTrigger>
  );
}

export default Submit;
