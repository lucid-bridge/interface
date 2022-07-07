import useSWR from "swr";
import { getLogs } from "utils";
import useDestinationContract from "./useDestinationContract";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";

export default function useTransferBoughtLogs(suspense = false) {
  const destinationContract = useDestinationContract();
  const shouldFetch = !!destinationContract;

  const result = useSWR(
    shouldFetch ? ["TransferBoughtLogs"] : null,
    getLogs(26698559, destinationContract!),
    { suspense }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);
  return result;
}
