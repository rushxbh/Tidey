import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";

const EthWalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: ethBalance, isLoading } = useBalance({
    address: address,
  });

  return (
    <div className="bg-white border border-blue-200 rounded-xl shadow-lg px-4 py-3 w-56 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow text-lg">
            ⚡
          </span>
          <span className="font-semibold text-blue-700 text-base">
            ETH Wallet
          </span>
        </div>
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
                        className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow hover:from-blue-500 hover:to-blue-700 transition"
                      >
                        Connect
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow hover:bg-red-600 transition"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={openAccountModal}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition"
                    >
                      {account.displayName}
                    </button>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>

      {isConnected && (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2 py-1">
            <span className="text-xs text-blue-600 font-medium">Wallet:</span>
            <span className="font-mono text-xs text-gray-700">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-blue-100 rounded-lg px-2 py-1">
            <span className="text-xs text-blue-700 font-medium">Balance:</span>
            {isLoading ? (
              <span className="text-xs text-gray-400">Loading...</span>
            ) : (
              <span className="font-bold text-xs text-blue-900">
                {ethBalance
                  ? parseFloat(ethBalance.formatted).toFixed(4)
                  : "0.0000"}{" "}
                ETH
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EthWalletConnect;
