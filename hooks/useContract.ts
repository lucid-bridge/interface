import { Contract } from "ethers";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function useContract<T extends Contract = Contract>(
  address: string,
  ABI: any
): T | null {
  const { web3Provider, address: accountAddress } = useSelector(
    (state: RootState) => state.web3
  );

  return useMemo(() => {
    if (!accountAddress || !ABI || !web3Provider) {
      return null;
    }

    try {
      return new Contract(address, ABI, web3Provider.getSigner(accountAddress));
    } catch (error) {
      console.log("Failed to get contract", error);
      return null;
    }
  }, [web3Provider]) as T;
}
