import type { BigNumber } from "ethers";

export interface TransferProps {
  data: string;
  topics: string[];
}

export interface TransferData {
  amount: BigNumber;
  destination: string;
  fee: BigNumber;
  feeRampup: BigNumber;
  startTime: BigNumber;
  tokenAddress: string;
}
