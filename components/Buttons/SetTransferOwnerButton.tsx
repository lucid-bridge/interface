import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
  Button,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
} from "@chakra-ui/react";
import { TransferData } from "types";
import { BigNumber, ethers } from "ethers";
import useDestinationContract from "hooks/useDestinationContract";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { hashTransferData } from "utils";

interface Props {
  transferData: TransferData;
  transferId: BigNumber;
}

export default function SetTransferOwnerButton({
  transferData,
  transferId,
}: Props) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [owner, setOwner] = useState("");
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(false);
  const destinationContract = useDestinationContract();
  const { address } = useSelector((state: RootState) => state.web3);

  const handleClose = () => {
    setOwner("");
    onClose();
  };

  const isError = !ethers.utils.isAddress(owner);

  useEffect(() => {
    if (destinationContract && address) {
      (async () => {
        try {
          setLoading(true);

          const transferHash = hashTransferData(transferData, transferId);
          const currentOwner = await destinationContract.transferOwners(
            transferHash
          );

          if (currentOwner == ethers.constants.AddressZero) {
            setAvailable(transferData.destination === address);
          } else {
            setAvailable(currentOwner === address);
          }
        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      })();
    }
  }, [destinationContract, address]);

  const handleSetOwner = async () => {
    if (!destinationContract || !owner) return;

    try {
      setLoading(true);
      const tx = await destinationContract.changeOwner(
        transferData,
        transferId,
        owner
      );
      await tx.wait();

      setAvailable(false);

      toast({
        title: "Set new owner.",
        description: "New owner set successfully.",
        status: "success",
        duration: 7000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);

      toast({
        title: "Set new owner.",
        description: "Failed to set new owner.",
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    }
    handleClose();
    setLoading(false);
  };

  return (
    <Box>
      <Button
        isLoading={loading}
        isDisabled={!available}
        colorScheme="telegram"
        variant="outline"
        onClick={onOpen}
      >
        Set new owner
      </Button>

      <Modal isCentered isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set new onwer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={isError}>
              <FormLabel>New owner address</FormLabel>
              <Input
                id="owner"
                name="owner"
                type="text"
                onChange={(e) => setOwner(e.target.value)}
              />
              <FormErrorMessage>Not a valid address</FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              colorScheme="telegram"
              mr={3}
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              isDisabled={isError}
              colorScheme="telegram"
              onClick={handleSetOwner}
              isLoading={loading}
            >
              Set
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
