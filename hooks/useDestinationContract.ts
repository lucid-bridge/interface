import useContract from "./useContract";
import { destinationAddress } from "../config/contracts";
import l2DestinationABI from "../contracts/L2Destination.json";
import { L2Destination } from "../contracts/types/L2Destination";

export default function useDestinationContract() {
  return useContract<L2Destination>(destinationAddress, l2DestinationABI.abi);
}
