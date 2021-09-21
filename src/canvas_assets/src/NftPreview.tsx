import { ActionButton, Button } from "@react-spectrum/button";
import { Dialog, DialogContainer } from "@react-spectrum/dialog";
import { Flex } from "@react-spectrum/layout";
import { Switch } from "@react-spectrum/switch";
import { Heading, Text } from "@react-spectrum/text";
import { Content, Footer, Header } from "@react-spectrum/view";
import FullScreen from "@spectrum-icons/workflow/FullScreen";
import React, { useState } from "react";
import styled from "styled-components";

const Picture = styled.picture<{ isDark: boolean }>`
  display: flex;
  aspect-ratio: 1;
  background: ${(props) => (props.isDark ? "black" : "white")};
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
  const [isDark, setIsDark] = useState(defaultMode !== "light");

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
                <Switch isSelected={isDark} onChange={setIsDark}>
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
                <Picture isDark={isDark}>
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
            <Switch isSelected={isDark} onChange={setIsDark}>
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
          <Picture isDark={isDark}>
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
