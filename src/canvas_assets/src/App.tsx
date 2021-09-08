import React from "react";
import { Provider, defaultTheme, Flex } from "@adobe/react-spectrum";
import PictureDrag from "./PictureDrag";

interface Props {}

function App(props: Props) {
  return (
    <Provider theme={defaultTheme}>
      <main>
        <Flex
          direction="column"
          justifyContent="center"
          alignItems="start"
          marginBottom="4rem"
          margin="4px"
        >
          <h1>Canvas #1</h1>
          <Flex
            direction="column"
            wrap="wrap"
            justifyContent="start"
            alignItems="end"
            gap="3rem"
          >
            <PictureDrag />
          </Flex>
        </Flex>
        {/* <Submit ctx={ctx} latest={latest} isModified={isModified} /> */}
      </main>
    </Provider>
  );
}

export default App;
