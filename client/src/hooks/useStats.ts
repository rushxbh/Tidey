import { TIDEY_ADDRESS } from "../contracts/config";
import { TideyABI } from "../generated/factories/contracts/Tidey__factory";
import { useReadContract } from "wagmi";

// Hook to get top volunteers (pass how many you want)
export function useTopVolunteers(count: number | bigint) {
  return useReadContract({
    address: TIDEY_ADDRESS,
    abi: TideyABI,
    functionName: "getTopVolunteers",
    args: [BigInt(count)],
  });
}

// Hook to get contract stats (no arguments)
export function useContractStats() {
  return useReadContract({
    address: TIDEY_ADDRESS,
    abi: TideyABI,
    functionName: "getContractStats",
    args: [],
  });
}