import React from "react";
import { Provider, defaultTheme, Flex, Header } from "@adobe/react-spectrum";
import Canvases from "./Canvases";
import { createContext } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../declarations/canvas_backend/canvas_backend.did";
import { useAuthClient } from "./hooks";
import Logo from "./Logo";
import LoginSection from "./LoginSection";

interface Props {}

export const AppContext = React.createContext<{
  authClient?: AuthClient;
  setAuthClient?: React.Dispatch<AuthClient>;
  isAuthenticated?: boolean;
  setIsAuthenticated?: React.Dispatch<React.SetStateAction<boolean>>;
  login: () => void;
  logout: () => void;
  actor?: ActorSubclass<_SERVICE>;
}>({
  login: () => {},
  logout: () => {},
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
  console.log(actor);
  return (
    <Provider theme={defaultTheme}>
      <AppContext.Provider
        value={{
          authClient,
          setAuthClient,
          isAuthenticated,
          setIsAuthenticated,
          login,
          logout,
          actor,
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
          {/* <Submit ctx={ctx} latest={latest} isModified={isModified} /> */}
        </main>
      </AppContext.Provider>
    </Provider>
  );
}

export default App;
