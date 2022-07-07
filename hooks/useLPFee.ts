import { L2Destination } from "contracts/types";
import useSWR from "swr";
import { TransferData } from "types";
import useDestinationContract from "./useDestinationContract";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

function getLPFee(destinationContract: L2Destination) {
  return async (_: string, transferData: TransferData) => {
    const timestamp = (await destinationContract.provider.getBlock("latest"))
      .timestamp;
    return await destinationContract.getLPFee(transferData, timestamp);
  };
}

export default function useLPFee(
  transferData?: TransferData,
  suspense = false
) {
  const destinationContract = useDestinationContract();

  const shouldFetch =
    !!destinationContract && typeof transferData !== "undefined";

  const result = useSWR(
    shouldFetch ? ["GetLPFee", transferData] : null,
    getLPFee(destinationContract!),
    { suspense }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);

  return result;
}
