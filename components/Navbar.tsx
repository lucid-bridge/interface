import {
  Box,
  Heading,
  Container,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Button,
  Badge,
  Stack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { HamburgerIcon } from "@chakra-ui/icons";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { shortenAddress } from "utils";

const Web3Button = dynamic(() => import("./Buttons/Web3Button"), {
  ssr: false,
  loading: () => <Button colorScheme="telegram" isLoading={true} />,
});

const getLinks = () => [
  {
    name: "Transfer",
    href: "/",
  },
  {
    name: "Liquidity Provider",
    href: "/liquidity-provider",
  },
  {
    name: "Pools",
    href: "/pools",
  },
];

export default function Navbar() {
  const { user, address } = useSelector((state: RootState) => state.web3);

  return (
    <Box w="100%" bg="gray.50" p={7} mb={10} shadow="lg">
      <Container
        maxW="container.lg"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Heading size="lg">Bridge</Heading>

        <HStack spacing={10} display={{ base: "none", lg: "block" }}>
          {getLinks().map((link, i) => {
            return (
              <NextLink key={i} href={link.href} passHref>
                <Link>{link.name}</Link>
              </NextLink>
            );
          })}
        </HStack>

        <Stack direction={{ base: "column", md: "row" }}>
          <Box style={{ position: "relative" }}>
            {user || address ? (
              <Badge
                colorScheme="linkedin"
                variant="subtle"
                maxW="220px"
                fontSize="14px"
                noOfLines={1}
                textTransform="none"
                px={2}
                py={1}
                borderRadius="lg"
                style={{
                  position: "absolute",
                  zIndex: 1,
                  top: "-50%",
                  left: "-80%",
                }}
              >
                {user ? user.sub : shortenAddress(address!)}
              </Badge>
            ) : null}

            <Web3Button />
          </Box>

          <Box
            textAlign="center"
            ml={3}
            display={{ base: "inline-block", lg: "none" }}
          >
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                variant="outline"
              />

              <MenuList>
                {getLinks().map((link, i) => {
                  return (
                    <NextLink key={i} href={link.href} passHref>
                      <MenuItem as={Link}>{link.name}</MenuItem>
                    </NextLink>
                  );
                })}
              </MenuList>
            </Menu>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
