import { useWriteContract } from "wagmi";
import { ethers } from "ethers";
import { TIDEY_ADDRESS } from "../contracts/config";
import { TideyABI } from "../generated/factories/contracts/Tidey__factory";

export function useRegisterVolunteer() {
  const { writeContractAsync, isPending } = useWriteContract();

  const registerVolunteer = async (userName: string, userEmail: string, userPhone: string) => {
    let tx;
    try {
      tx = await writeContractAsync({
        address: TIDEY_ADDRESS,
        abi: TideyABI,
        functionName: "registerVolunteer",
        args: [userName, userEmail, userPhone],
      });
    } catch (blockchainErr: any) {
      throw new Error(
        blockchainErr?.shortMessage ||
        blockchainErr?.message ||
        "Transaction rejected or failed"
      );
    }

    // Wait for transaction to be mined
    const provider = new ethers.BrowserProvider(window.ethereum);
    const receipt = await provider.waitForTransaction(tx, 1, 60000);
    if (!receipt || receipt.status !== 1) {
      throw new Error("Blockchain transaction failed or was reverted");
    }
    return receipt;
  };

  return { registerVolunteer, isPending };
}