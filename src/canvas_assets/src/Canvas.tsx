import { Flex } from "@adobe/react-spectrum";
import React from "react";
import Canvases from "./Canvases";

interface Props {}

function Canvas(props: Props) {
  const {} = props;

  return (
    <main>
      <Flex
        direction="column"
        justifyContent="center"
        alignItems="start"
        marginBottom="4rem"
        margin="4px"
      >
        <Flex
          direction="column"
          wrap="wrap"
          justifyContent="start"
          alignItems="start"
          marginBottom="3rem"
          gap="3rem"
        >
          <div>
            <p>
              Welcome to IC Canvas! Below you are two canvases. One contains a
              1024 x 1024 pixel canvas, which starts as a blank slate. For your
              convenience, you can click anywhere on the canvas, or drag the
              blinking cursor to choose where you would like to work.
            </p>
            <p>
              Below is a second canvas, which shows you a zoomed in view of the
              primary canvas. You can use the round cursor to select the pixel
              you would like to update. You can update the color you want to use
              with the color picker, and then you can submit your pixel to the
              canvas! Everything you see, from the image to the website you're
              interacting with is running on the Internet Computer. Updates are
              free - there are no gas costs to participate.
            </p>
            <p>
              This experiment will start fresh on Monday, September 13th, and
              will run for a week. Every participant will recieve a single pixel
              as an NFT at the end of the experiment, and we will auction off
              the final image as an NFT, with half the proceeds going to the
              hackathon team, and half going to environmental charity. Logging
              in with the Internet Identity is secure and anonymous, and is how
              we will reward you with your NFT pixel after the canvas is
              complete. Have fun, and try joining the DSCVR community and
              coordinating at{" "}
              <a href="https://dscvr.one/p/ic-canvas">
                https://dscvr.one/p/ic-canvas
              </a>
              !
            </p>
          </div>
          <Canvases />
        </Flex>
      </Flex>
    </main>
  );
}

export default Canvas;
