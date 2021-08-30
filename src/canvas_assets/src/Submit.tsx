import {
  ActionButton,
  Button,
  ButtonGroup,
  Content,
  Dialog,
  DialogTrigger,
  Divider,
  Header,
  Heading,
  Text,
} from "@adobe/react-spectrum";
import React, { useEffect } from "react";
import { canvas } from "../../declarations/canvas";
import { Image } from "../../declarations/canvas/canvas.did";
import { compareImages, extractImage } from "./utils";

interface Props {
  ctx?: CanvasRenderingContext2D;
  latest?: Image;
}

function Submit(props: Props) {
  const { ctx, latest } = props;
  const [price, setPrice] = React.useState("");

  useEffect(() => {
    checkImage();
  }, [ctx, latest]);

  const checkImage = () => {
    if (ctx && latest) {
      const image = extractImage(ctx);
      const diffs = compareImages(latest, image);

      // 1.25 million cycles divided by 1TC
      const locale = navigator.language;

      // 30 million cycles
      const rate = 30000000;
      const trillion = 1000000000000;

      const price = new Intl.NumberFormat(locale).format(
        (rate * diffs.length) / trillion
      );
      setPrice(price);
    }
  };

  const submit = async () => {
    if (ctx) {
      const image = extractImage(ctx);

      const result = await canvas.upload(image);
      if ("ok" in result) {
        alert("success!");
      }
    }
  };

  return (
    <DialogTrigger
      onOpenChange={(isOpen) => {
        if (isOpen) checkImage();
      }}
    >
      <ActionButton type="submit">Upload your version</ActionButton>
      {(close) => {
        return (
          <Dialog>
            <Heading>Upload your canvas</Heading>
            <Divider />
            <Content>
              <Text>
                Feel good about your changes? You should! Your contribution will
                become an unchangeable step of this history of this canvas.
              </Text>
              <p>Your estimated cost will be: {price} TC</p>
              <p>
                Rate is 30 MC (million cycles) per pixel changed. 1TC is roughly
                $1.42 USD, so about ${(Number(price) * 1.4228).toFixed(2)}
              </p>
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button
                variant="cta"
                onPress={async () => {
                  await submit();
                  close();
                }}
              >
                Confirm
              </Button>
            </ButtonGroup>
          </Dialog>
        );
      }}
    </DialogTrigger>
  );
}

export default Submit;
