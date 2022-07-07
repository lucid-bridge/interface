import type { Web3Provider } from "@ethersproject/providers";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import useSWR from "swr";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

function getETHBalance(web3Provider: Web3Provider) {
  return async (_: string, address: string) => {
    return await web3Provider.getBalance(address);
  };
}

export default function useETHBalance(address?: string, suspense = false) {
  const { web3Provider } = useSelector((state: RootState) => state.web3);

  const shouldFetch = !!web3Provider && typeof address === "string";

  const result = useSWR(
    shouldFetch ? ["ETHBalance", address] : null,
    getETHBalance(web3Provider!),
    { suspense }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);
  return result;
}
