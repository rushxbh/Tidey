import React from "react";
import EthWalletConnect from "./EthWalletConnect";
import RewardWalletConnect from "./RewardWalletConnect";

const WalletDashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <EthWalletConnect />
      <RewardWalletConnect />
    </div>
  );
};

export default WalletDashboard;
