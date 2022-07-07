import { Heading, Stat, StatLabel, StatNumber, VStack } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import useDestinationContract from "hooks/useDestinationContract";
import { useEffect, useState } from "react";
import { parseBalance } from "utils";
import { TransferProps, TransferData } from "types";
import Card from "./Card";

import SetTransferOwnerButton from "./Buttons/SetTransferOwnerButton";
import WithdrawTransferButton from "./Buttons/WithdrawTransferButton";

export default function BoughtTransfer({ data, topics }: TransferProps) {
  const l2destinationContract = useDestinationContract();
  const [transferData, setTransferData] = useState<TransferData>();
  const [transferId, setTransferId] = useState<BigNumber>();

  useEffect(() => {
    if (l2destinationContract) {
      const log = l2destinationContract.interface.parseLog({
        topics,
        data,
      });

      const transferData: TransferData = {
        amount: log.args.amount,
        destination: log.args.destination,
        fee: log.args.fee,
        feeRampup: log.args.feeRampup,
        startTime: log.args.startTime,
        tokenAddress: log.args.tokenAddress,
      };

      setTransferData(transferData);
      setTransferId(log.args.transferID);
    }
  }, [l2destinationContract]);

  if (!transferData || !transferId) {
    return null;
  }

  return (
    <Card>
      <Heading size="md">#{transferId.toString()}</Heading>

      <VStack spacing={7}>
        <Stat textAlign="center">
          <StatLabel>Amount</StatLabel>
          <StatNumber>{parseBalance(transferData.amount)} ETH</StatNumber>
        </Stat>
      </VStack>
      <VStack>
        <WithdrawTransferButton
          transferData={transferData}
          transferId={transferId}
        />

        <SetTransferOwnerButton
          transferData={transferData}
          transferId={transferId}
        />
      </VStack>
    </Card>
  );
}
