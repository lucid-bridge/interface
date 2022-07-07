import { Box } from "@chakra-ui/react";

interface CardProps {
  children: React.ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
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
      {children}
    </Box>
  );
}
