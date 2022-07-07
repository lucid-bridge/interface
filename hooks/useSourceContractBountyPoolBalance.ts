import useSourceContract from "./useSourceContract";
import useSWR from "swr";
import { L2Source } from "contracts/types";
import { ethers } from "ethers";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

function getBountyPool(l2Source: L2Source) {
  return async (_: string, tokenAddress: string) => {
    return await l2Source.tokenBountyPool(tokenAddress);
  };
}

export default function useSourceContractBountyPoolBalance(
  tokenAddress?: string,
  suspense = false
) {
  const l2SourceContract = useSourceContract();

  const shouldFetch = !!l2SourceContract;

  if (!tokenAddress) {
    tokenAddress = ethers.constants.AddressZero;
  }

  const result = useSWR(
    shouldFetch ? ["BountyPool", tokenAddress] : null,
    getBountyPool(l2SourceContract!),
    { suspense }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
