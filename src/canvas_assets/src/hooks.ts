import { ActorSubclass, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { clear, get, remove, set } from "local-storage";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { canisterId, createActor } from "../../declarations/canvas_backend";
import { _SERVICE } from "../../declarations/canvas_backend/canvas_backend.did";

type UseAuthClientProps = {};

export type Provider = "II" | "Plug";
export function useAuthClient(props?: UseAuthClientProps) {
  const [authClient, setAuthClient] = useState<AuthClient>();
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authProvider, setAuthProvider] = useState<"II" | "Plug" | undefined>(
    undefined
  );

  const login = async (provider: Provider) => {
    if (provider === "Plug") {
      try {
        const hasAllowed = await (window as any).ic.plug.requestConnect();

        // Whitelist
        const whitelist = [canisterId];

        // Make the request
        const isConnected = await (window as any).ic.plug.requestConnect({
          whitelist,
        });
        const identity = await (window as any).ic?.plug?.agent._identity;
        initActor(identity);
        toast.success("Logged in successfully!");
      } catch (err) {
        console.error(err);
        toast.error(
          "Could not link with Plug. Please try again or continue with Internet Identity"
        );
      }
    } else {
      authClient?.login({
        identityProvider: process.env.II_URL,
        onSuccess: () => {
          initActor();
          setIsAuthenticated(true);
          toast.success("Logged in successfully!");
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
