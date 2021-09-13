import {
  ActionButton,
  AlertDialog,
  DialogTrigger,
  Flex,
  Text,
} from "@adobe/react-spectrum";
import RealTimeCustomerProfile from "@spectrum-icons/workflow/RealTimeCustomerProfile";
import React, { useContext, useState } from "react";
import { AppContext } from "./App";

interface Props {}

function LoginSection(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const {} = props;

  const { login, isAuthenticated } = useContext(AppContext);

  return (
    <Flex margin="auto 1rem">
      <DialogTrigger onOpenChange={setIsOpen}>
        <ActionButton id="loginButton" onPress={() => setIsOpen(!isOpen)}>
          <RealTimeCustomerProfile />
          <Text>{isAuthenticated ? "You are logged in!" : "Log in"}</Text>
        </ActionButton>
        <AlertDialog
          title="Log in to play!"
          variant="confirmation"
          primaryActionLabel="Internet Identity"
          cancelLabel="Cancel"
          onPrimaryAction={() => {
            login();
            setIsOpen(false);
          }}
        >
          You can log in using Internet Identity, or you can use your Plug
          Wallet, if you are using desktop and have the extension installed!
        </AlertDialog>
      </DialogTrigger>
    </Flex>
  );
}

export default LoginSection;
