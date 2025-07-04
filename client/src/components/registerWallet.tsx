import React, { useState } from "react";
import axios from "axios";
import { Wallet, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Import useAuth

const WalletRegister: React.FC = () => {
  const { user } = useAuth(); // Get user from AuthContext
  const walletAddress = user?.walletAddress || "";
  const walletConnected = !!user?.walletConnected;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async () => {
    setError("");
    setIsRegistered(false);
    if (!walletConnected || !walletAddress) {
      setError("No wallet connected. Please connect your wallet first.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing. Please log in.");
        setLoading(false);
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
      setIsRegistered(true);
    } catch (err: any) {
      console.error("Wallet registration error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(`Failed to register wallet: ${err.message || "Unknown error"}`);
      }
    } finally {
      setLoading(false);
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
          disabled={loading || isRegistered || !walletConnected || !walletAddress}
          className={`w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3
            ${
              loading || isRegistered || !walletConnected || !walletAddress
                ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-inner"
                : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Registering...
            </>
          ) : isRegistered ? (
            <>
              <Check className="h-5 w-5" />
              Wallet Registered!
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

        {isRegistered && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 shadow-sm text-sm">
            <p className="font-medium">
              🎉 Your wallet has been successfully registered!
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
      </div>
    </div>
  );
};

export default WalletRegister;
          
         