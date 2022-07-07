import useSWR from "swr";
import { getLogs } from "utils";
import useKeepSWRDataLiveAsBlocksArrive from "./useKeepSWRDataLiveAsBlocksArrive";
import useSourceContract from "./useSourceContract";

export default function useTransferInitiatedLogs(suspense = false) {
  const sourceContract = useSourceContract();
  const shouldFetch = !!sourceContract;

  const result = useSWR(
    shouldFetch ? ["TransferInitiatedLogs"] : null,
    getLogs(26698559, sourceContract!),
    { suspense }
  );

  useKeepSWRDataLiveAsBlocksArrive(result.mutate);
  return result;
}
