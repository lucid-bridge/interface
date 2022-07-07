import { Button, useToast } from "@chakra-ui/react";
import useSourceContract from "hooks/useSourceContract";
import { ethers } from "ethers";
import { useState } from "react";

export default function TransferEntireTokenBalanceButton() {
  const toast = useToast();

  const [transferring, setTransferring] = useState(false);
  const l2SourceContract = useSourceContract();

  const handleTransfer = async () => {
    if (!l2SourceContract) return;

    try {
      setTransferring(true);
      const zeroAddress = ethers.constants.AddressZero;
      const tx = await l2SourceContract.transferTokenBalanceToRemote(
        zeroAddress
      );
      await tx.wait();

      toast({
        title: "Transfer entire token balance.",
        description: "Transferred entire token balance",
        status: "success",
        duration: 7000,
        isClosable: true,
      });
    } catch (error) {
      console.log(error);

      toast({
        title: "Transfer entire token balance.",
        description: "Failed to transfer entire token balance.",
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    }
    setTransferring(false);
  };

  return (
    <Button
      onClick={handleTransfer}
      isLoading={transferring}
      colorScheme="telegram"
      variant="outline"
    >
      Transfer entire balance to destination contract
    </Button>
  );
}
