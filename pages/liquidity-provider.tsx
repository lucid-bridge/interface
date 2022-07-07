import {
  VStack,
  CircularProgress,
  Center,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { destinationAddress } from "config/contracts";
import useETHBalance from "hooks/useETHBalance";
import { parseBalance } from "utils";
import useTransferInitiatedLogs from "hooks/useTransferInitiatedLogs";
import useTransferBoughtLogs from "hooks/useTransferBoughtLogs";
import InitiatedTransfer from "components/InitiatedTransfer";
import BoughtTransfer from "components/BoughtTransfer";
import RootStateUpdateButton from "components/Buttons/RootStateUpdateButton";
import Card from "components/Card";

const LiquidityProvider: NextPage = () => {
  const { data: l2DestinationBalance } = useETHBalance(destinationAddress);
  const { data: transferInitiatedLogs } = useTransferInitiatedLogs();
  const { data: transferBoughtLogs } = useTransferBoughtLogs();

  return (
    <Box>
      <Box my={10}>
        <Card>
          <Box>
            <Stat mb={1} textAlign="center">
              <StatLabel>Destination contract ETH balance</StatLabel>
              <StatNumber>
                {l2DestinationBalance ? (
                  <Text>{parseBalance(l2DestinationBalance)}</Text>
                ) : (
                  <CircularProgress size="6" isIndeterminate color="blue.300" />
                )}
              </StatNumber>
            </Stat>
            <RootStateUpdateButton />
          </Box>

          <Box bg="gray.50" p={5} w="200px" borderRadius="lg">
            <Text color="gray.600" align="center">
              Disabled buttons mean you don't have access to do the action.
            </Text>
          </Box>
        </Card>
      </Box>

      <Tabs isFitted variant="enclosed-colored" colorScheme="telegram">
        <TabList>
          <Tab>All initiated Transfers</Tab>
          <Tab>All bought Transfers</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {transferInitiatedLogs ? (
              <VStack align="stretch" spacing={5}>
                {transferInitiatedLogs.map((item, i) => {
                  return (
                    <InitiatedTransfer
                      key={i}
                      data={item.raw_log_data}
                      topics={item.raw_log_topics}
                    />
                  );
                })}
              </VStack>
            ) : (
              <Center>
                <CircularProgress isIndeterminate color="blue.300" />
              </Center>
            )}
          </TabPanel>

          <TabPanel>
            {transferBoughtLogs ? (
              <VStack align="stretch" spacing={5}>
                {transferBoughtLogs.map((item, i) => {
                  return (
                    <BoughtTransfer
                      key={i}
                      data={item.raw_log_data}
                      topics={item.raw_log_topics}
                    />
                  );
                })}
              </VStack>
            ) : (
              <Center>
                <CircularProgress isIndeterminate color="blue.300" />
              </Center>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default LiquidityProvider;
