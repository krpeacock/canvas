import { ActorSubclass, Identity, SignIdentity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { clear, get, remove, set } from "local-storage";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { canisterId, createActor } from "../../declarations/canvas_backend";
import { _SERVICE } from "../../declarations/canvas_backend/canvas_backend.did";

type UseAuthClientProps = {};

export function useAuthClient(props?: UseAuthClientProps) {
  const [authClient, setAuthClient] = useState<AuthClient>();
  const [actor, setActor] = useState<ActorSubclass<_SERVICE>>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = async () => {
    authClient?.login({
      identityProvider: process.env.II_URL,
      onSuccess: () => {
        initActor();
        toast.success("Logged in successfully!");
      },
    });
  };

  const initActor = async () => {
    const identity = authClient?.getIdentity() as SignIdentity;
    const actor = createActor(canisterId as string, {
      agentOptions: {
        identity,
      },
    });
    setActor(actor);
    debugger;
    setIsAuthenticated(true);
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
      initActor();
    });
  }, []);

  return {
    authClient,
    setAuthClient,
    isAuthenticated,
    setIsAuthenticated,
    login,
    logout,
    actor,
  };
}
