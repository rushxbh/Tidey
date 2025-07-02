import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { AQUACOIN_ADDRESS } from "../contracts/config"; // Import your address

// Use your AQUACOIN address
const REWARD_TOKEN_ADDRESS = AQUACOIN_ADDRESS;

// Standard ERC-20 ABI for balanceOf and symbol
const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

const RewardWalletConnect: React.FC = () => {
  const { address, isConnected } = useAccount();

  // Read token balance
  const { data: tokenBalance, isLoading: balanceLoading } = useReadContract({
    address: REWARD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Read token symbol
  const { data: tokenSymbol } = useReadContract({
    address: REWARD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "symbol",
  });

  // Read token name
  const { data: tokenName } = useReadContract({
    address: REWARD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "name",
  });

  // Read token decimals
  const { data: tokenDecimals } = useReadContract({
    address: REWARD_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "decimals",
  });

  // Format token balance
  const formatTokenBalance = (
    balance: bigint | undefined,
    decimals: number | undefined
  ) => {
    if (!balance || decimals === undefined) return "0.00";
    const divisor = BigInt(10 ** decimals);
    const formatted = Number(balance) / Number(divisor);
    return formatted.toFixed(2);
  };

  return (
    <div className="bg-gradient-to-r from-teal-500 to-green-500 p-6 rounded-lg shadow-lg text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-2xl">🪙</span>
          {tokenName || "AquaCoin"} Wallet
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
                        className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        Connect for AquaCoins
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
                        className="bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
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
            <p className="text-sm opacity-80 mb-1">Wallet Address</p>
            <p className="font-mono text-sm">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>

          <div className="bg-white/20 p-4 rounded-lg">
            <p className="text-sm opacity-80 mb-1">
              {tokenName || "AquaCoin"} Balance
            </p>
            {balanceLoading ? (
              <p className="text-lg font-semibold">Loading...</p>
            ) : (
              <p className="text-2xl font-bold">
                {formatTokenBalance(
                  tokenBalance as bigint,
                  tokenDecimals as number
                )}{" "}
                {tokenSymbol || "AQUA"}
              </p>
            )}
          </div>

          <div className="bg-white/20 p-3 rounded-lg">
            <p className="text-xs opacity-80">
              💡 Earn more AquaCoins by participating in beach cleanups!
            </p>
          </div>

          {/* Contract Info */}
          <div className="bg-white/10 p-2 rounded text-xs opacity-70">
            <p>
              Contract: {REWARD_TOKEN_ADDRESS.slice(0, 8)}...
              {REWARD_TOKEN_ADDRESS.slice(-6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardWalletConnect;
