import { ActionButton, Button } from "@adobe/react-spectrum";
import { Dialog, DialogContainer } from "@adobe/react-spectrum";
import { Flex } from "@adobe/react-spectrum";
import { Switch } from "@adobe/react-spectrum";
import { Heading, Text } from "@adobe/react-spectrum";
import { Content, Footer, Header } from "@adobe/react-spectrum";
import React, { useState } from "react";
import styled from "styled-components";
import FullScreen from "@spectrum-icons/workflow/FullScreen";

const Picture = styled.picture<{ $isdark: boolean }>`
  display: flex;
  aspect-ratio: 1;
  background: ${(props) => (props.$isdark ? "black" : "white")};
  img {
    width: 100%;
    max-height: initial;
    max-width: initial;
    aspect-ratio: 1;
  }
`;

const Preview = styled.div<{ fullscreen: boolean }>`
  @media (min-width: 767px) {
    max-width: ${({ fullscreen }) =>
      fullscreen ? "95vw" : "calc(33% - 2rem)"};
  }
  section[role="dialog"] div {
    grid-template: none;
    grid-template-columns: initial;
    grid-template-rows: initial;
  }
  *[data-ismodal="true"] {
    overflow: scroll !important;
  }
`;

interface Props {
  imgSrc: React.ImgHTMLAttributes<HTMLImageElement>["src"];
  defaultMode?: "light" | "dark";
  title: string;
  children?: React.ReactChild;
}

function NftPreview(props: Props) {
  const { imgSrc, defaultMode, title, children } = props;
  const [fullScreen, setFullScreen] = useState(false);
  const [isdark, setisdark] = useState(defaultMode !== "light");

  return (
    <Preview fullscreen={fullScreen}>
      {fullScreen ? (
        <DialogContainer
          onDismiss={() => setFullScreen(false)}
          type="fullscreenTakeover"
        >
          <Dialog size="L" width="90vw" UNSAFE_style={{ overflow: "scroll" }}>
            <Content>
              <Flex
                justifyContent="space-between"
                marginBottom="1rem"
                width="100%"
              >
                <Switch isSelected={isdark} onChange={setisdark}>
                  <Text>Toggle background</Text>
                </Switch>
                <ActionButton
                  onPress={() => {
                    setFullScreen(!fullScreen);
                  }}
                >
                  <FullScreen></FullScreen>
                </ActionButton>
              </Flex>
              <Flex direction="column" marginBottom="1rem">
                <Picture $isdark={isdark}>
                  <img src={imgSrc} />
                </Picture>
                <Heading level={3}>{title}</Heading>
              </Flex>
              <div>{children}</div>
            </Content>
          </Dialog>
        </DialogContainer>
      ) : (
        <Flex direction="column" marginBottom="1rem">
          <Flex justifyContent="space-between" marginBottom="1rem">
            <Switch isSelected={isdark} onChange={setisdark}>
              <Text>Toggle background</Text>
            </Switch>
            <ActionButton
              onPress={() => {
                setFullScreen(!fullScreen);
              }}
            >
              <FullScreen></FullScreen>
            </ActionButton>
          </Flex>
          <Picture $isdark={isdark}>
            <img src={imgSrc} />
          </Picture>
          <Heading level={3}>{title}</Heading>
          <div>{children}</div>
        </Flex>
      )}
    </Preview>
  );
}

export default NftPreview;
