import type { NextPage } from "next";
import {
  Box,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  VStack,
  useToast,
  Text,
} from "@chakra-ui/react";
import { ArrowDownIcon } from "@chakra-ui/icons";
import { Formik, Field, FormikErrors } from "formik";
import { ethers } from "ethers";
import useSourceContract from "hooks/useSourceContract";
import Resolution from "@unstoppabledomains/resolution";
import { useState } from "react";

const resolution = new Resolution();

interface TransferValues {
  amount: string;
  lpFee: string;
  startTime: string;
  feeRampup: string;
  recepient: string;
}

const Home: NextPage = () => {
  const [domainResolving, setDomainResolving] = useState(false);

  const toast = useToast();
  const l2SourceContract = useSourceContract();
  return (
    <Box>
      <Heading textAlign="center">Transfer</Heading>

      <Formik
        validateOnChange={false}
        validateOnBlur={true}
        initialValues={{
          amount: "0",
          lpFee: "0",
          startTime: "0",
          feeRampup: "0",
          recepient: "",
        }}
        onSubmit={async (values, actions) => {
          if (values.recepient.length === 0) {
            actions.setFieldError("recepient", "Recepient is required");
            return;
          }

          try {
            if (!l2SourceContract) return;

            const amount = ethers.utils.parseEther(values.amount);
            const amountPlusFee = amount.mul(10005).div(10000);
            const lpFee = ethers.utils.parseEther(values.lpFee);

            const timestamp = (
              await l2SourceContract.provider.getBlock("latest")
            ).timestamp;

            const startTime = timestamp + Number(values.startTime);
            const feeRampup = Number(values.feeRampup);

            const transferData = {
              tokenAddress: ethers.constants.AddressZero,
              destination: values.recepient,
              amount,
              fee: lpFee,
              startTime,
              feeRampup,
            };

            let tx = await l2SourceContract.withdraw(transferData, {
              value: amountPlusFee,
            });

            await tx.wait();

            toast({
              title: "Initiate the transfer.",
              description: "Transfer has initiated successfully.",
              status: "success",
              duration: 7000,
              isClosable: true,
            });
          } catch (error: any) {
            console.log(error);
            toast({
              title: "Initiate the transfer.",
              description: error.data ? error.data.message : error.message,
              status: "error",
              duration: 7000,
              isClosable: true,
            });
          }
        }}
      >
        {({
          handleSubmit,
          errors,
          touched,
          isSubmitting,
          isValid,
          setFieldValue,
          setFieldError,
          values,
        }) => (
          <form onSubmit={handleSubmit}>
            <VStack spacing={5} p={10}>
              <Box w="80%" padding="4" borderWidth="2px" borderRadius="md">
                <FormControl
                  mb={5}
                  isInvalid={!!errors.amount && touched.amount}
                >
                  <FormLabel htmlFor="amount">Amount</FormLabel>
                  <NumberInput precision={6} step={0.1} min={0}>
                    <Field
                      as={NumberInputField}
                      name="amount"
                      id="amount"
                      validate={(value: string) => {
                        let error;

                        if (!(Number(value) > 0)) {
                          error = "Amount must be greater than 0";
                        }

                        return error;
                      }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Amount To Transfer</FormHelperText>
                  <FormErrorMessage>{errors.amount}</FormErrorMessage>
                </FormControl>

                <FormControl mb={5} isInvalid={!!errors.lpFee && touched.lpFee}>
                  <FormLabel htmlFor="lpFee">LPFee</FormLabel>
                  <NumberInput precision={6} step={0.0001} min={0}>
                    <Field
                      as={NumberInputField}
                      name="lpFee"
                      id="lpFee"
                      validate={(value: string) => {
                        let error;

                        if (!(Number(value) > 0)) {
                          error = "lpFee must be greater than 0";
                        }

                        return error;
                      }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Liquidity Provider Fee</FormHelperText>
                  <FormErrorMessage>{errors.lpFee}</FormErrorMessage>
                </FormControl>

                <FormControl
                  mb={5}
                  isInvalid={!!errors.startTime && touched.startTime}
                >
                  <FormLabel htmlFor="startTime">Start Time</FormLabel>
                  <NumberInput min={0} defaultValue={0}>
                    <Field
                      as={NumberInputField}
                      name="startTime"
                      id="startTime"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>
                    How much seconds after current block timestamp
                  </FormHelperText>
                  <FormErrorMessage>{errors.startTime}</FormErrorMessage>
                </FormControl>

                <FormControl
                  mb={5}
                  isInvalid={!!errors.feeRampup && touched.feeRampup}
                >
                  <FormLabel htmlFor="lpFee">Fee Rampup</FormLabel>
                  <NumberInput min={0} defaultValue={0}>
                    <Field
                      as={NumberInputField}
                      name="feeRampup"
                      id="feeRampup"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>
                    How much Seconds after startTime
                  </FormHelperText>
                  <FormErrorMessage>{errors.feeRampup}</FormErrorMessage>
                </FormControl>
              </Box>

              <ArrowDownIcon />

              <Box w="100%" padding="4" borderWidth="2px" borderRadius="md">
                <FormControl isInvalid={!!errors.recepient}>
                  <FormLabel htmlFor="recepient" mb="3">
                    Recipient
                  </FormLabel>
                  <Input
                    name="recepient"
                    id="recepient"
                    placeholder="UNS domain / address (e.g 0x123...)"
                    onBlur={async (event) => {
                      setFieldError("recepient", undefined);
                      const value = event.target.value;
                      let error;

                      if (value.length === 0) {
                        error = "Recipient is required";
                        setFieldValue("recepient", "");
                        setFieldError("recepient", error);
                        return;
                      }

                      if (ethers.utils.isAddress(value)) {
                        setFieldValue("recepient", value);
                        setFieldError("recepient", undefined);
                        return error;
                      }

                      setDomainResolving(true);
                      setFieldValue("recepient", "");
                      try {
                        const resolvedAddress = await resolution.addr(
                          value,
                          "ETH"
                        );

                        setFieldValue("recepient", resolvedAddress);
                        setFieldError("recepient", undefined);
                      } catch (err: any) {
                        error = err.message;
                      }
                      setDomainResolving(false);

                      setFieldError("recepient", error);
                    }}
                  />
                  <FormHelperText>
                    {domainResolving && "Resolving..."}
                    {values.recepient.length > 0 && (
                      <Box>
                        <Text color="black" fontSize="15px" mb={2}>
                          Send to:
                        </Text>
                        <Text display="flex" gap={2} ml={2}>
                          <Text color="black" fontWeight="bold">
                            ETH:
                          </Text>
                          <Text>{values.recepient}</Text>
                        </Text>
                      </Box>
                    )}
                  </FormHelperText>
                  <FormErrorMessage>{errors.recepient}</FormErrorMessage>
                </FormControl>
              </Box>

              <Button
                isDisabled={!isValid || !l2SourceContract}
                isLoading={isSubmitting}
                type="submit"
                loadingText="Transferring"
                colorScheme="telegram"
                variant="outline"
                w="sm"
              >
                Transfer
              </Button>
            </VStack>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Home;
