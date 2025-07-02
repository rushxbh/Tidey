import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";

const EthWalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: ethBalance, isLoading } = useBalance({
    address: address,
  });

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          ETH Wallet
        </h3>
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        Connect ETH Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex gap-2">
                      <button
                        onClick={openChainModal}
                        className="bg-white/20 text-white px-3 py-2 rounded-lg text-sm hover:bg-white/30 transition-colors"
                      >
                        {chain.hasIcon && (
                          <div className="w-4 h-4 rounded-full overflow-hidden inline-block mr-1">
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl}
                                className="w-4 h-4"
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </button>

                      <button
                        onClick={openAccountModal}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        {account.displayName}
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {isConnected && (
        <div className="space-y-3">
          <div className="bg-white/20 p-4 rounded-lg">
            <p className="text-sm opacity-80 mb-1">Address</p>
            <p className="font-mono text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          <div className="bg-white/20 p-4 rounded-lg">
            <p className="text-sm opacity-80 mb-1">ETH Balance</p>
            {isLoading ? (
              <p className="text-lg font-semibold">Loading...</p>
            ) : (
              <p className="text-2xl font-bold">
                {ethBalance
                  ? parseFloat(ethBalance.formatted).toFixed(4)
                  : "0.0000"}{" "}
                ETH
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EthWalletConnect;
