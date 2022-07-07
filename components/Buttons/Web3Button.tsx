import { Button, useToast } from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store";
import { shortenAddress } from "utils";
import { providerOptions } from "../../config/provider-options";
import * as UAuthWeb3Modal from "@uauth/web3modal";

let web3Modal: Web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });

  UAuthWeb3Modal.registerWeb3Modal(web3Modal);
}

export default function Web3Button() {
  const toast = useToast();
  const { provider, web3Provider, address } = useSelector(
    (state: RootState) => state.web3
  );

  const dispatch = useDispatch();

  const uauth = useMemo(() => {
    console.log("New UAuth instance");
    const { package: uauthPackage, options: uauthOptions } =
      providerOptions["custom-uauth"];

    return UAuthWeb3Modal.getUAuth(uauthPackage, uauthOptions);
  }, []);

  const connect = useCallback(
    async function () {
      let provider;
      try {
        provider = await web3Modal.connect();
      } catch (err) {
        console.error("connection canceled");
        return;
      }

      let user: any;
      if (web3Modal.cachedProvider === "custom-uauth") {
        user = await uauth.user();
      }

      const web3Provider = new ethers.providers.Web3Provider(provider);

      const signer = web3Provider.getSigner(user?.wallet_address);
      const address = await signer.getAddress();

      const network = await web3Provider.getNetwork();

      if (network.chainId !== 80001) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13881" }],
          });
        } catch (error: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (error.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainName: "Mumbai",
                    chainId: "0x13881",
                    nativeCurrency: {
                      name: "MATIC",
                      decimals: 18,
                      symbol: "MATIC",
                    },
                    rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
                  },
                ],
              });
            } catch (error) {
              console.log(error);

              toast({
                title: "Switch Network",
                description:
                  "Please Switch metmask's network to Polygon Testnet(Mumbai).",
                status: "error",
                duration: 10000,
                isClosable: true,
              });

              return;
            }
          } else {
            console.log(error);
            return;
          }
        }
      }

      dispatch({
        type: "SET_WEB3_PROVIDER",
        payload: {
          provider,
          web3Provider,
          address,
          chainId: network.chainId,
          user,
        },
      });
    },
    [provider]
  );

  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      if (provider?.disconnect && typeof provider.disconnect === "function") {
        await provider.disconnect();
      }
      dispatch({
        type: "RESET_WEB3_PROVIDER",
      });
    },
    [provider]
  );

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("accountsChanged", accounts);

        disconnect();
        connect();

        // dispatch({
        //   type: "SET_ADDRESS",
        //   payload: {
        //     address: accounts[0],
        //   },
        // });
      };

      const handleChainChanged = (_hexChainId: string) => {
        window.location.reload();
      };

      const handleDisconnect = (error: { code: number; message: string }) => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider, disconnect]);

  return web3Provider ? (
    <Button colorScheme="telegram" onClick={disconnect}>
      Disconnect
    </Button>
  ) : (
    <Button colorScheme="telegram" onClick={connect}>
      Connect Wallet
    </Button>
  );
}
