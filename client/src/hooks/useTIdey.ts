import { useCallback } from "react";
import { TIDEY_ADDRESS } from "../contracts/config";
import { TideyABI } from "../generated/factories/contracts/Tidey__factory";
import { useWriteContract, useReadContract } from "wagmi";


export function useTideyWrite() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const registerVolunteer = useCallback(
    (name: string, email: string, mobile: string) =>
      writeContractAsync({
        address: TIDEY_ADDRESS,
        abi: TideyABI,
        functionName: "registerVolunteer",
        args: [name, email, mobile],
      }),
    [writeContractAsync]
  );

  const updateProfile = useCallback(
    (name: string, email: string, mobile: string) =>
      writeContractAsync({
        address: TIDEY_ADDRESS,
        abi: TideyABI,
        functionName: "updateVolunteerProfile",
        args: [name, email, mobile],
      }),
    [writeContractAsync]
  );

  return { registerVolunteer, updateProfile, isPending, error };
}

export function useVolunteerInfo(volunteerAddress: `0x${string}`) {
  return useReadContract({
    address: TIDEY_ADDRESS,
    abi: TideyABI,
    functionName: "getVolunteerInfo",
    args: [volunteerAddress],
  });
}
