import {
  ActionButton,
  AlertDialog,
  DialogTrigger,
  Flex,
  Text,
} from "@adobe/react-spectrum";
import RealTimeCustomerProfile from "@spectrum-icons/workflow/RealTimeCustomerProfile";
import React from "react";
import { useAuthClient } from "./hooks";

interface Props {}

function LoginSection(props: Props) {
  const {} = props;

  const { login, isAuthenticated } = useAuthClient();

  return (
    <Flex margin="auto 1rem">
      <DialogTrigger>
        <ActionButton>
          <RealTimeCustomerProfile />
          <Text>{isAuthenticated ? "You are logged in!" : "Log in"}</Text>
        </ActionButton>
        <AlertDialog
          title="Log in to play!"
          variant="confirmation"
          primaryActionLabel="Internet Identity"
          secondaryActionLabel="Log in with Plug"
          cancelLabel="Cancel"
          onPrimaryAction={() => login("II")}
          onSecondaryAction={() => login("Plug")}
        >
          You can log in using Internet Identity, or you can use your Plug
          Wallet, if you are using desktop and have the extension installed!
        </AlertDialog>
      </DialogTrigger>
    </Flex>
  );
}

export default LoginSection;
