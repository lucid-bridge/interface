import { Button, useToast } from "@chakra-ui/react";
import useDestinationContract from "hooks/useDestinationContract";
import { useEffect, useState } from "react";
import { hashTransferData } from "../../utils";
import { TransferData } from "../../types";
import { BigNumber, ethers } from "ethers";

interface Props {
  transferData: TransferData;
  transferId: BigNumber;
}

export default function BuyTransferButton({ transferData, transferId }: Props) {
  const toast = useToast();
  const l2DestinationContract = useDestinationContract();

  const [loading, setLoading] = useState(false);
  const [available, setAvailabe] = useState(true);
  useEffect(() => {
    if (l2DestinationContract && transferData && transferId) {
      (async () => {
        setLoading(true);
        const transferHash = hashTransferData(transferData, transferId);
        const owner = await l2DestinationContract.transferOwners(transferHash);
        setAvailabe(owner === ethers.constants.AddressZero);
        setLoading(false);
      })();
    }
  }, [l2DestinationContract, transferData, transferId]);

  const handleBuy = async () => {
    if (!l2DestinationContract || !transferData || !transferId) return;

    try {
      setLoading(true);

      const data = {
        tokenAddress: transferData.tokenAddress,
        amount: transferData.amount,
        fee: transferData.fee,
        feeRampup: transferData.feeRampup,
        startTime: transferData.startTime,
        destination: transferData.destination,
      };

      const currentTime = (
        await l2DestinationContract.provider.getBlock("latest")
      ).timestamp;

      const lpFee = await l2DestinationContract.getLPFee(data, currentTime);

      const tx = await l2DestinationContract.buy(transferData, transferId, {
        value: transferData.amount.sub(lpFee),
      });

      await tx.wait();

      toast({
        title: "Buy the transfer.",
        description: "The transfer has bought successfully.",
        status: "success",
        duration: 7000,
        isClosable: true,
      });
      setAvailabe(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Buy the transfer.",
        description: "failed to buy the transfer.",
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleBuy}
      isLoading={loading}
      isDisabled={!available}
      colorScheme="telegram"
      variant="outline"
    >
      Buy
    </Button>
  );
}
