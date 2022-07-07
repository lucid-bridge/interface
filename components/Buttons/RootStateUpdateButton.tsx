import { Text, Button, useToast, HStack } from "@chakra-ui/react";
import useSourceContract from "hooks/useSourceContract";
import { useEffect, useState } from "react";
import useDestinationContract from "hooks/useDestinationContract";
import { CheckIcon } from "@chakra-ui/icons";

export default function RootStateUpdateButton() {
  const toast = useToast();
  const sourceContract = useSourceContract();
  const destionationContract = useDestinationContract();
  const [loading, setLoading] = useState(false);
  const [rootStateUpdated, setRootStateUpdated] = useState(false);

  useEffect(() => {
    if (sourceContract && destionationContract) {
      (async () => {
        setLoading(true);

        const rootHashKey = await sourceContract.getRootHashKey();
        const rootExists = await destionationContract.remoteRootExists(
          rootHashKey
        );
        setRootStateUpdated(rootExists);

        setLoading(false);
      })();
    }
  }, [sourceContract, destionationContract]);

  const handleRootStateUpdate = async () => {
    if (!sourceContract) return null;

    try {
      setLoading(true);
      const tx = await sourceContract.updateRemoteRoot();
      await tx.wait();

      toast({
        title: "Update root state on remote chain.",
        description: "Root state updated on the remote chain.",
        status: "success",
        duration: 7000,
        isClosable: true,
      });
      setRootStateUpdated(true);
    } catch (error) {
      console.log(error);

      toast({
        title: "Update root state on remote chain.",
        description: "Failed to send root state to remote chain.",
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    }

    setLoading(false);
  };

  return (
    <Button
      onClick={handleRootStateUpdate}
      colorScheme="telegram"
      variant="outline"
      mb={5}
      isLoading={loading}
      isDisabled={rootStateUpdated}
    >
      {rootStateUpdated ? (
        <HStack>
          <CheckIcon color="green" />
          <Text>Root state is updated on the remote chain</Text>
        </HStack>
      ) : (
        "Update root state on the remote chain"
      )}
    </Button>
  );
}
