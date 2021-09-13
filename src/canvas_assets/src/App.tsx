import React, { useEffect } from "react";
import {
  Provider as SpectrumProvider,
  defaultTheme,
  Flex,
  Header,
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
                    Welcome to IC Canvas! This is an experimental project from
                    the Dfinity Foundation 2021 hackathon. Below you are two
                    canvases. One contains a 1024 x 1024 pixel canvas, which
                    starts as a blank slate. For your convenience, you can click
                    anywhere on the canvas, or drag the blinking cursor to
                    choose where you would like to work.
                  </p>
                  <p>
                    Below is a second canvas, which shows you a zoomed in view
                    of the primary canvas. You can use the round cursor to
                    select the pixel you would like to update. You can update
                    the color you want to use with the color picker, and then
                    you can submit your pixel to the canvas! Everything you see,
                    from the image to the website you're interacting with is
                    running on the Internet Computer. Updates are free - there
                    are no gas costs to participate.
                  </p>
                  <p>
                    This experiment will start fresh on Monday, September 13th,
                    and will run for a week. Every participant will recieve a
                    single pixel as an NFT at the end of the experiment, and we
                    will auction off the final image as an NFT, with half the
                    proceeds going to the hackathon team, and half going to
                    environmental charity. Logging in with the Internet Identity
                    is secure and anonymous, and is how we will reward you with
                    your NFT pixel after the canvas is complete. Have fun!
                  </p>
                </div>
                <Canvases />
              </Flex>
            </Flex>
          </main>
        </AppContext.Provider>
      </SpectrumProvider>
    </>
  );
}

export default App;
