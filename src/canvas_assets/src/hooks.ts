import { ActorSubclass, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { clear, get, remove, set } from "local-storage";
import { useState, useEffect } from "react";
import { canisterId, createActor } from "../../declarations/canvas_backend";
import { _SERVICE } from "../../declarations/canvas_backend/canvas_backend.did";

type UseAuthClientProps = {};
export function useAuthClient(props?: UseAuthClientProps) {
  const [authClient, setAuthClient] = useState<AuthClient>();
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authProvider, setAuthProvider] = useState<"II" | "Plug" | undefined>(
    undefined
  );

  type Provider = "II" | "Plug";
  const login = async (provider: Provider = "II") => {
    const hasAllowed = await (window as any).ic.plug.requestConnect();

    // Whitelist
    const whitelist = [canisterId];

    // Make the request
    const isConnected = await (window as any).ic.plug.requestConnect({
      whitelist,
    });
    const identity = await (window as any).ic?.plug?.agent._identity;
    initActor(identity);

    if (hasAllowed) {
      console.log("Plug wallet is connected");
    }
    if (provider === "Plug") {
    } else {
      authClient?.login({
        identityProvider: process.env.II_URL,
        onSuccess: () => {
          initActor();
          setIsAuthenticated(true);
        },
      });
    }
  };

  const initActor = (identity?: Identity) => {
    const actor = createActor(canisterId as string, {
      agentOptions: {
        identity: identity || authClient?.getIdentity(),
      },
    });
    setActor(actor);
  };

  const logout = () => {
    clear();
    setIsAuthenticated(false);
    setActor(undefined);
  };

  useEffect(() => {
    AuthClient.create().then(async (client) => {
      const isAuthenticated = await client.isAuthenticated();
      setAuthClient(client);
      setIsAuthenticated(true);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) initActor();
  }, [isAuthenticated]);

  return {
    authClient,
    setAuthClient,
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    actor,
    authProvider,
  };
}
