import { L2Destination, L2Source } from "contracts/types";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { TransferData } from "types";

export function parseBalance(
  value: BigNumberish,
  decimals = 18,
  decimalToDisplay = 6
) {
  return parseFloat(formatUnits(value, decimals)).toFixed(decimalToDisplay);
}

function isL2Source(contract: L2Source | L2Destination): contract is L2Source {
  return !!(contract as L2Source).filters.TransferInitiated;
}

export function getLogs(
  startingBlockNumber: number,
  contract: L2Source | L2Destination
) {
  return async () => {
    let topicHash: string;

    if (isL2Source(contract)) {
      topicHash = (contract.filters.TransferInitiated().topics as string[])[0];
    } else {
      topicHash = (contract.filters.TransferBought().topics as string[])[0];
    }

    const endingBlockNumber = await contract.provider.getBlockNumber();
    let url = `https://api.covalenthq.com/v1/80001/events/topics/${topicHash}/?quote-currency=USD&format=JSON&starting-block=${startingBlockNumber}&ending-block=${endingBlockNumber}&sender-address=${contract.address}&key=${process.env.NEXT_PUBLIC_COVALENT_KEY}`;
    const response = await fetch(url);
    const responseJson = await response.json();
    return responseJson.data.items as {
      raw_log_data: string;
      raw_log_topics: string[];
    }[];
  };
}

export function hashTransferData(
  transferData: TransferData,
  transferId: BigNumber
) {
  const abiCoder = new ethers.utils.AbiCoder();
  const transferHash = ethers.utils.keccak256(
    abiCoder.encode(
      [
        "address",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
      ],
      [
        transferData.tokenAddress,
        transferData.destination,
        transferData.amount,
        transferData.fee,
        transferData.startTime,
        transferData.feeRampup,
        transferId,
      ]
    )
  );

  return transferHash;
}

export function shortenAddress(address: string, length = 5) {
  return `${address.substring(0, length)}...${address.substring(
    address.length - length
  )}`;
}
