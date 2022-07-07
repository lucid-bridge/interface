import type { Web3Provider } from "@ethersproject/providers";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import useSWR from "swr";

function getBlockNumber(web3Provider: Web3Provider) {
  return async () => {
    return await web3Provider.getBlockNumber();
  };
}

export default function useBlockNumber() {
  const { web3Provider } = useSelector((state: RootState) => state.web3);

  const shouldFetch = !!web3Provider;

  return useSWR(
    shouldFetch ? ["BlockNumber"] : null,
    getBlockNumber(web3Provider!),
    {
      refreshInterval: 10 * 1000,
    }
  );
}
