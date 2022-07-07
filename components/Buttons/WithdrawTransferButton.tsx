import { Button, useToast } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { ethers } from "ethers";
import useDestinationContract from "hooks/useDestinationContract";
import useSourceContract from "hooks/useSourceContract";
import { useEffect, useState } from "react";
import { hashTransferData } from "utils";
import { TransferData } from "types";

import { useSelector } from "react-redux";
import { RootState } from "redux/store";

interface Props {
  transferData: TransferData;
  transferId: BigNumber;
}

export default function WithdrawTransferButton({
  transferData,
  transferId,
}: Props) {
  const toast = useToast();
  const l2destinationContract = useDestinationContract();
  const l2SourceContract = useSourceContract();
  const [loading, setLoading] = useState(false);

  const [available, setAvailable] = useState(true);
  const { address } = useSelector((state: RootState) => state.web3);

  useEffect(() => {
    if (l2destinationContract && address) {
      (async () => {
        setLoading(true);
        const transferHash = hashTransferData(transferData, transferId);
        const owner = await l2destinationContract.transferOwners(transferHash);
        if (owner === ethers.constants.AddressZero) {
          setAvailable(transferData.destination === address);
        } else {
          setAvailable(owner === address);
        }
        setLoading(false);
      })();
    }
  }, [l2destinationContract, address]);

  const handleWithdraw = async () => {
    if (!l2destinationContract || !l2SourceContract) return;

    try {
      setLoading(true);
      const abiCoder = new ethers.utils.AbiCoder();

      const message = abiCoder.encode(
        ["address", "address", "uint256", "uint256", "uint256", "uint256"],
        [
          transferData.tokenAddress,
          transferData.destination,
          transferData.amount,
          transferData.fee,
          transferData.startTime,
          transferData.feeRampup,
        ]
      );

      const messageProof = await l2SourceContract.getMessageProof(
        transferId,
        message
      );

      const rHash = messageProof.rootHash;
      const branchMask = messageProof.branchMask;
      const siblings = messageProof.siblings;

      const tx = await l2destinationContract.withdraw(
        transferData,
        transferId,
        rHash,
        branchMask,
        siblings
      );

      await tx.wait();

      toast({
        title: "Withdraw the transfer.",
        description: "Withdraw the transfer successfully.",
        status: "success",
        duration: 7000,
        isClosable: true,
      });
      setAvailable(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Withdraw the transfer.",
        description: "Failed to withdraw the transfer",
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleWithdraw}
      isDisabled={!available}
      isLoading={loading}
      colorScheme="telegram"
      variant="outline"
    >
      Withdraw
    </Button>
  );
}
