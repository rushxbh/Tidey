import { AQUACOIN_ADDRESS } from "../contracts/config";
import { useAccount, useReadContract } from "wagmi";

const abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
];

export function useBalanceOfAQUA() {
  const { address } = useAccount();
  const { data: tokenBalance, isLoading: balanceLoading } = useReadContract({
    address: AQUACOIN_ADDRESS,
    abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: tokenSymbol, isLoading: symbolLoading } = useReadContract({
    address: AQUACOIN_ADDRESS,
    abi,
    functionName: "symbol",
  });

  const { data: tokenDecimals, isLoading: decimalsLoading } = useReadContract({
    address: AQUACOIN_ADDRESS,
    abi,
    functionName: "decimals",
  });

  return {
    tokenBalance,
    balanceLoading,
    tokenSymbol,
    symbolLoading,
    tokenDecimals,
    decimalsLoading,
  };
}
