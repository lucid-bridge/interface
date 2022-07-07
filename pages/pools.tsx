import type { NextPage } from "next";
import {
  Box,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  CircularProgress,
} from "@chakra-ui/react";
import useETHBalance from "hooks/useETHBalance";
import { sourceAddress } from "config/contracts";
import { parseBalance } from "utils";
import useSourceContractBountyPoolBalance from "hooks/useSourceContractBountyPoolBalance";
import TransferEntireTokenBalanceButton from "components/Buttons/TransferEntireTokenBalanceButton";

const Pools: NextPage = () => {
  const { data: l2SourceBalance } = useETHBalance(sourceAddress);
  const { data: ethBountyPool } = useSourceContractBountyPoolBalance();

  return (
    <Box>
      <Heading textAlign="center" mb={5}>
        Pools
      </Heading>

      <VStack align="stretch" spacing={5}>
        <Box
          px={7}
          py={4}
          border="solid"
          flexDirection={{ base: "column", lg: "row" }}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={5}
        >
          <VStack spacing={7}>
            <Stat textAlign="center">
              <StatLabel>Source Contract ETH balance</StatLabel>
              <StatNumber>
                {l2SourceBalance ? (
                  parseBalance(l2SourceBalance) + " ETH"
                ) : (
                  <CircularProgress size={5} isIndeterminate color="blue.300" />
                )}
              </StatNumber>
            </Stat>
            <Stat textAlign="center">
              <StatLabel>Source Contract ETH bounty pool</StatLabel>
              <StatNumber>
                {ethBountyPool ? (
                  parseBalance(ethBountyPool) + " ETH"
                ) : (
                  <CircularProgress size={5} isIndeterminate color="blue.300" />
                )}
              </StatNumber>
            </Stat>
          </VStack>
          <TransferEntireTokenBalanceButton />
        </Box>
      </VStack>
    </Box>
  );
};

export default Pools;
