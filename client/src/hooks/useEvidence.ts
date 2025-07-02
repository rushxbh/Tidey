import { TIDEY_ADDRESS } from "../contracts/config";
import { TideyABI } from "../generated/factories/contracts/Tidey__factory";
import { useWriteContract, useReadContract } from "wagmi";
import { useCallback } from "react";

// Write hook for submitting evidence
export function useEvidenceWrite() {
  const { writeContract, isPending, error } = useWriteContract();

  const submitEvidence = useCallback(
    (
      photoHash: string,
      mlScore: number | bigint,
      geoLocation: string,
      description: string
    ) =>
      writeContract({
        address: TIDEY_ADDRESS,
        abi: TideyABI,
        functionName: "submitEvidence",
        args: [photoHash, BigInt(mlScore), geoLocation, description],
      }),
    [writeContract]
  );

  return { submitEvidence, isPending, error };
}

// Read hook for evidence info
export function useEvidenceInfo(evidenceId: number | bigint) {
  return useReadContract({
    address: TIDEY_ADDRESS,
    abi: TideyABI,
    functionName: "getEvidenceInfo",
    args: [BigInt(evidenceId)],
  });
}