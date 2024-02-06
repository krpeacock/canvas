import React, { useEffect } from "react";
import {
  Provider as SpectrumProvider,
  defaultTheme,
  Flex,
  Header,
  View,
  Text,
} from "@adobe/react-spectrum";
import Canvases, { canvasSize } from "./Canvases";
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
import { Toaster } from "react-hot-toast";
import { Principal } from "@dfinity/principal";
import { canvas_backend } from "../../declarations/canvas_backend";
import { page_visits } from "../../declarations/page_visits";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Canvas from "./Canvas";
import Landing from "./Landing";

interface Props {}

const DEFAULT_COOLDOWN = 30;

export const AppContext = React.createContext<{
  authClient?: AuthClient;
  setAuthClient?: React.Dispatch<AuthClient>;
  isAuthenticated?: boolean;
  setIsAuthenticated?: React.Dispatch<React.SetStateAction<boolean>>;
  login: () => Promise<void>;
  logout: () => void;
  actor?: ActorSubclass<_SERVICE>;
  position: Position;
  setPosition?: React.Dispatch<React.SetStateAction<Position>>;
  absolutePosition: Position;
  setAbsolutePosition?: React.Dispatch<React.SetStateAction<Position>>;
  color: Color;
  setColor?: React.Dispatch<React.SetStateAction<Color>>;
  cooldown: number;
}>({
  login: async () => {},
  logout: () => {},
  position: { x: 0, y: 0 },
  absolutePosition: { x: 0, y: 0 },
  color: {
    r: 34,
    g: 25,
    b: 77,
    a: 255,
  },
  cooldown: DEFAULT_COOLDOWN,
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
  const [cooldown, setCooldown] = useState<number>(DEFAULT_COOLDOWN);
  const [absolutePosition, setAbsolutePosition] = useState<Position>({
    x: canvasSize / 32,
    y: canvasSize / 32,
  });
  const [color, setColor] = useState<Color>({
    r: 34,
    g: 25,
    b: 77,
    a: 100,
  });

  useEffect(() => {
    canvas_backend.check_cooldown().then((cd) => {
      setCooldown(Number(cd));
    });
    const deviceType =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
        ? { Mobile: null }
        : { Desktop: null };
    if (!window.location.origin.includes("localhost")) {
      page_visits.log(window.location.href, deviceType);
    }
  }, []);

  return (
    <>
      <Toaster
        toastOptions={{
          duration: 5000,
          position: "top-center",
        }}
        containerClassName="toast-container"
      />
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
            absolutePosition,
            setAbsolutePosition,
            color,
            setColor,
            cooldown,
          }}
        >
          <Header>
            <Flex
              direction="row"
              wrap
              justifyContent="space-between"
              margin="0 1rem"
            >
              <Flex direction="row" gap="1rem" width={"auto"}>
                <Logo />
                <h1 style={{ whiteSpace: "nowrap" }}>IC Canvas</h1>
              </Flex>
              <LoginSection />
            </Flex>
          </Header>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />}></Route>
              <Route path="/archive" element={<Canvas />}></Route>
            </Routes>
          </Router>
          <footer>
            2021 - A <a href="https://kyle-peacock.com">Kyle Peacock</a> project
          </footer>
        </AppContext.Provider>
      </SpectrumProvider>
    </>
  );
}

export default App;
