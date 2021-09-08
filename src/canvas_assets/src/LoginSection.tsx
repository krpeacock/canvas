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
          <Text>Login</Text>
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
          You are running low on disk space. Delete unnecessary files to free up
          space.
        </AlertDialog>
      </DialogTrigger>
    </Flex>
  );
}

export default LoginSection;
