import React from "react";
import {
  Provider as SpectrumProvider,
  defaultTheme,
  Flex,
  Header,
} from "@adobe/react-spectrum";
import Canvases from "./Canvases";
import { AuthClient } from "@dfinity/auth-client";
import { ActorSubclass } from "@dfinity/agent";
import {
  Color,
  Position,
  _SERVICE,
} from "../../declarations/canvas_backend/canvas_backend.did";
import { useAuthClient } from "./hooks";
import Logo from "./Logo";
import LoginSection from "./LoginSection";
import { useState } from "react";
import Submit from "./Submit";
import type { Provider } from "./hooks";

interface Props {}

export const AppContext = React.createContext<{
  authClient?: AuthClient;
  setAuthClient?: React.Dispatch<AuthClient>;
  isAuthenticated?: boolean;
  setIsAuthenticated?: React.Dispatch<React.SetStateAction<boolean>>;
  login: (provider: Provider) => Promise<void>;
  logout: () => void;
  actor?: ActorSubclass<_SERVICE>;
  position: Position;
  setPosition?: React.Dispatch<React.SetStateAction<Position>>;
  color: Color;
  setColor?: React.Dispatch<React.SetStateAction<Color>>;
}>({
  login: async (provider: Provider) => {},
  logout: () => {},
  position: { x: 0, y: 0 },
  color: {
    r: 34,
    g: 25,
    b: 77,
    a: 100,
  },
});

function App(props: Props) {
  const {
    authClient,
    setAuthClient,
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    actor,
  } = useAuthClient();
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [color, setColor] = useState<Color>({
    r: 34,
    g: 25,
    b: 77,
    a: 100,
  });
  console.log(actor);
  return (
    <SpectrumProvider theme={defaultTheme}>
      <AppContext.Provider
        value={{
          authClient,
          setAuthClient,
          isAuthenticated,
          setIsAuthenticated,
          login,
          logout,
          actor,
          position,
          setPosition,
          color,
          setColor,
        }}
      >
        <Header>
          <Flex direction="row" justifyContent="space-between" margin="0 1rem">
            <Flex direction="row" gap="1rem" width={"auto"}>
              <Logo />
              <h1 style={{ whiteSpace: "nowrap" }}>IC Canvas</h1>
            </Flex>
            <LoginSection />
          </Flex>
        </Header>
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
              alignItems="end"
              gap="3rem"
            >
              <Canvases />
            </Flex>
          </Flex>
          <Submit />
        </main>
      </AppContext.Provider>
    </SpectrumProvider>
  );
}

export default App;
