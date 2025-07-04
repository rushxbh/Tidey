import React, { useState } from "react";
import axios from "axios";
import { Wallet, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useWriteContract } from "wagmi";
import { ethers } from "ethers";
import { TIDEY_ADDRESS } from "../contracts/config";
import { TideyABI } from "../generated/factories/contracts/Tidey__factory";

const WalletRegister: React.FC = () => {
  const { user } = useAuth();
  const walletAddress = user?.walletAddress || "";
  const walletConnected = !!user?.walletConnected;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [blockchainRegistered, setBlockchainRegistered] = useState(false);
  const [blockchainError, setBlockchainError] = useState("");
  const [blockchainInProgress, setBlockchainInProgress] = useState(false);

  const { writeContractAsync, isPending: isBlockchainPending } = useWriteContract();

  const userName = user?.name || "";
  const userEmail = user?.email || "";
  // const userPhone = user?.phone || "";
  const userPhone = "9090909090";

  console.log("userPhone:", userPhone);
  console.log("userEmail:", userEmail);
  console.log("userName:", userName);
  

  const handleRegister = async () => {
    setError("");
    setBlockchainError("");
    setIsRegistered(false);
    setBlockchainRegistered(false);

    if (!walletConnected || !walletAddress) {
      setError("No wallet connected. Please connect your wallet first.");
      return;
    }

    setLoading(true);
    setBlockchainInProgress(true);

    try {
      // Step 1: Register on the blockchain and wait for confirmation
      console.log("Starting blockchain registration...");
      let tx;
      try {
        tx = await writeContractAsync({
          address: TIDEY_ADDRESS,
          abi: TideyABI,
          functionName: "registerVolunteer",
          args: [userName, userEmail, userPhone],
        });
      } catch (blockchainErr: any) {
        // User rejected or failed to send
        throw new Error(blockchainErr?.shortMessage || blockchainErr?.message || "Transaction rejected or failed");
      }

      // Wait for transaction to be mined
      const provider = new ethers.BrowserProvider(window.ethereum);
      const receipt = await provider.waitForTransaction(tx, 1, 60000); // wait 1 confirmation, up to 60s
      if (!receipt || receipt.status !== 1) {
        throw new Error("Blockchain transaction failed or was reverted");
      }

      console.log("Blockchain registration successful");
      setBlockchainRegistered(true);

      // Step 2: Only after blockchain success, register wallet in MongoDB
      try {
        console.log("Starting MongoDB registration...");
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token is missing. Please log in.");
          return;
        }

        await axios.post(
          "/api/wallet-register/register-wallet",
          { walletAddress },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("MongoDB registration successful");
        setIsRegistered(true);
      } catch (mongoErr: any) {
        console.error("MongoDB registration error:", mongoErr);
        setError(
          `Database registration failed: ${
            mongoErr.response?.data?.message || mongoErr.message || "Unknown error"
          }`
        );
      }
    } catch (blockchainErr: any) {
      console.error("Blockchain registration error:", blockchainErr);
      setBlockchainError(
        `Blockchain registration failed: ${blockchainErr.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
      setBlockchainInProgress(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 w-full max-w-md text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <Wallet className="h-16 w-16 text-primary-600 animate-pulse-slow" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
          Register Your Wallet
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Register your wallet to start earning AquaCoins and redeeming exclusive
          rewards!
        </p>

        {walletAddress && walletConnected && (
          <p className="text-gray-700 font-medium mb-4">
            Wallet Address:{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
              {walletAddress.substring(0, 6)}...
              {walletAddress.substring(walletAddress.length - 4)}
            </span>
          </p>
        )}

        <button
          onClick={handleRegister}
          disabled={loading || isBlockchainPending || (isRegistered && blockchainRegistered) || !walletConnected || !walletAddress}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3
            ${
              loading || isBlockchainPending || (isRegistered && blockchainRegistered) || !walletConnected || !walletAddress
                ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-inner"
                : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
        >
          {loading || isBlockchainPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {blockchainRegistered ? "Registering in Database..." : "Registering on Blockchain..."}
            </>
          ) : isRegistered && blockchainRegistered ? (
            <>
              <Check className="h-5 w-5" />
              Wallet Fully Registered!
            </>
          ) : blockchainRegistered && !isRegistered ? (
            <>
              <Wallet className="h-5 w-5" />
              Complete Database Registration
            </>
          ) : (
            <>
              <Wallet className="h-5 w-5" />
              Register Wallet
            </>
          )}
        </button>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 shadow-sm text-sm">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {blockchainError && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 shadow-sm text-sm">
            <p className="font-medium">{blockchainError}</p>
            <p className="mt-2">
              Blockchain registration failed. Please try again.
            </p>
          </div>
        )}

        {isRegistered && blockchainRegistered && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 shadow-sm text-sm">
            <p className="font-medium">
              🎉 Your wallet has been successfully registered on our database and
              blockchain!
            </p>
            <p className="mt-2 text-gray-600">
              You can now proceed to explore rewards.
            </p>
            <button
              className="mt-4 text-primary-600 hover:underline font-medium"
              onClick={() => window.location.reload()}
            >
              Go to Rewards
            </button>
          </div>
        )}

        {blockchainRegistered && !isRegistered && !error && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4 shadow-sm text-sm">
            <p className="font-medium">
              ⚠️ Blockchain registration complete. Registering in our database...
            </p>
          </div>
        )}

        {blockchainInProgress && !blockchainRegistered && !blockchainError && (
          <div className="mt-6 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg p-4 shadow-sm text-sm">
            <p className="font-medium">
              Registering on blockchain... Please confirm the transaction in your wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletRegister;


