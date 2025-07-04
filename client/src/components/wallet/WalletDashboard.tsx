import React, { useState } from "react";
import EthWalletConnect from "./EthWalletConnect";
import RewardWalletConnect from "./RewardWalletConnect";
import { Wallet } from "lucide-react";
import { useAccount } from "wagmi";

const WalletDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected } = useAccount();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          isConnected
            ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        } transition-all duration-200`}
      >
        <Wallet className="h-5 w-5" />
        <span className="text-sm font-medium">
          {isConnected ? "Wallet Connected" : "Connect Wallet"}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-50 p-2 bg-white rounded-xl shadow-xl border border-gray-100">
            <div className="flex gap-3">
              <RewardWalletConnect />
              <EthWalletConnect />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WalletDashboard;
