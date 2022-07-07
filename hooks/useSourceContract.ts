import useContract from "./useContract";
import { sourceAddress } from "../config/contracts";
import l2SourceABI from "../contracts/L2Source.json";
import { L2Source } from "../contracts/types/L2Source";

export default function useSourceContract() {
  return useContract<L2Source>(sourceAddress, l2SourceABI.abi);
}
