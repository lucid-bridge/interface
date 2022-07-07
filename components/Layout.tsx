import React from "react";
import Navbar from "./Navbar";
import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { address } = useSelector((state: RootState) => state.web3);

  return (
    <Box>
      <Navbar />

      {address ? (
        <Container maxW="container.lg" pb={3}>
          {children}
        </Container>
      ) : (
        <Heading textAlign="center" mt={20}>
          Please connect{" "}
          <Text display="inline-block" color="blue.500">
            {" "}
            Wallet{" "}
          </Text>{" "}
          to continue.
        </Heading>
      )}
    </Box>
  );
}
