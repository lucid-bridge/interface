import {
  CircularProgress,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import useSourceContract from "hooks/useSourceContract";
import { useEffect, useState } from "react";
import { parseBalance, shortenAddress } from "../utils";
import { TransferData, TransferProps } from "../types";
import Card from "./Card";
import { BigNumber } from "ethers";
import SetTransferOwnerButton from "./Buttons/SetTransferOwnerButton";
import WithdrawTransferButton from "./Buttons/WithdrawTransferButton";
import BuyTransferButton from "./Buttons/BuyTransferButton";
import useLPFee from "hooks/useLPFee";

export default function InitiatedTransfer({ data, topics }: TransferProps) {
  const sourceContract = useSourceContract();
  const [transferData, setTransferData] = useState<TransferData>();
  const [transferId, setTransferId] = useState<BigNumber>();
  const { data: lpFee } = useLPFee(transferData);

  useEffect(() => {
    if (sourceContract) {
      const log = sourceContract.interface.parseLog({
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
  }, [sourceContract]);

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

        <Stat textAlign="center">
          <StatLabel>Current LP Fee</StatLabel>
          <StatNumber>
            {lpFee ? (
              parseBalance(lpFee)
            ) : (
              <CircularProgress size={6} isIndeterminate />
            )}
          </StatNumber>
        </Stat>

        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton px={10} color="blue.500">
              Transfer details
            </AccordionButton>
            <AccordionPanel>
              <VStack>
                <Stat textAlign="center">
                  <StatLabel>Fee</StatLabel>
                  <StatNumber>{parseBalance(transferData.fee)} ETH</StatNumber>
                </Stat>

                <Stat textAlign="center">
                  <StatLabel>Start Time</StatLabel>
                  <StatNumber>{transferData.startTime.toString()}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Fee Rampup</StatLabel>
                  <StatNumber>
                    +{transferData.feeRampup.toString()} Seconds
                  </StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Destination Address</StatLabel>
                  <StatNumber>
                    {shortenAddress(transferData.destination)}
                  </StatNumber>
                </Stat>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>

      <VStack>
        <BuyTransferButton
          transferData={transferData}
          transferId={transferId}
        />
        <SetTransferOwnerButton
          transferData={transferData}
          transferId={transferId}
        />
        <WithdrawTransferButton
          transferData={transferData}
          transferId={transferId}
        />
      </VStack>
    </Card>
  );
}
