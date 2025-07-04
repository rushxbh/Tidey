import { useCallback } from "react";
import { TIDEY_ADDRESS } from "../contracts/config";
import { TideyABI } from "../generated/factories/contracts/Tidey__factory";
import { useWriteContract, useReadContract } from "wagmi";

// Write operations (createTask, joinTask)
export function useTaskWrite() {
  const { writeContract, isPending, error } = useWriteContract();

  const createTask = useCallback(
    (
      title: string,
      description: string,
      location: string,
      startTime: number | bigint,
      endTime: number | bigint,
      maxParticipants: number | bigint
    ) =>
      writeContract({
        address: TIDEY_ADDRESS,
        abi: TideyABI,
        functionName: "createTask",
        args: [
          title,
          description,
          location,
          BigInt(startTime),
          BigInt(endTime),
          BigInt(maxParticipants),
          0n, 
        ],
      }),
    [writeContract]
  );

  const joinTask = useCallback(
    (taskId: number | bigint) =>
      writeContract({
        address: TIDEY_ADDRESS,
        abi: TideyABI,
        functionName: "joinTask",
        args: [BigInt(taskId)],
      }),
    [writeContract]
  );

  return { createTask, joinTask, isPending, error };
}

// Read single task info
export function useTaskInfo(taskId: number | bigint) {
  return useReadContract({
    address: TIDEY_ADDRESS,
    abi: TideyABI,
    functionName: "getTaskInfo",
    args: [BigInt(taskId)],
  });
}

// Read all active tasks (returns array of task IDs)
export function useActiveTasks() {
  return useReadContract({
    address: TIDEY_ADDRESS,
    abi: TideyABI,
    functionName: "getActiveTasks",
    args: [],
  });
}
