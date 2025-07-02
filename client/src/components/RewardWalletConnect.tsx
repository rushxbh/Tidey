import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { AQUACOIN_ADDRESS } from "../contracts/config"; // Import your address
import { Copy } from "lucide-react";

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

const copyToClipboard = (value: string) => {
  navigator.clipboard.writeText(value);
};

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
    <div className="bg-white border border-teal-200 rounded-xl shadow-lg px-4 py-3 w-72 min-w-[260px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-green-400 shadow text-lg">
            🪙
          </span>
          <span className="font-semibold text-teal-700 text-base">
            {tokenName || "AquaCoin"}
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
                        className="bg-gradient-to-r from-teal-400 to-green-400 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow hover:from-teal-500 hover:to-green-500 transition"
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
                      className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-xs font-semibold border border-teal-200 hover:bg-teal-100 transition"
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
          <div className="flex items-center gap-2 bg-teal-50 rounded-lg px-2 py-1 overflow-hidden">
            <span className="text-xs text-teal-600 font-medium flex-shrink-0">
              Wallet:
            </span>
            <span className="font-mono text-xs text-gray-700 truncate">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            {address && (
              <button
                className="ml-1 p-1 rounded hover:bg-teal-100"
                title="Copy address"
                onClick={() => copyToClipboard(address)}
                type="button"
              >
                <Copy className="w-3 h-3 text-teal-500" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-2 py-1 overflow-hidden">
            <span className="text-xs text-green-700 font-medium flex-shrink-0">
              Balance:
            </span>
            {balanceLoading ? (
              <span className="text-xs text-gray-400">Loading...</span>
            ) : (
              <>
                <span className="font-bold text-xs text-green-900 truncate max-w-[160px] inline-block align-middle">
                  {formatTokenBalance(
                    tokenBalance as bigint,
                    tokenDecimals as number
                  )}{" "}
                  {tokenSymbol || "AQUA"}
                </span>
                <button
                  className="ml-1 p-1 rounded hover:bg-green-100"
                  title="Copy balance"
                  onClick={() =>
                    copyToClipboard(
                      `${formatTokenBalance(
                        tokenBalance as bigint,
                        tokenDecimals as number
                      )} ${tokenSymbol || "AQUA"}`
                    )
                  }
                  type="button"
                >
                  <Copy className="w-3 h-3 text-green-600" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1">
            <span>Contract:</span>
            <span className="font-mono">
              {REWARD_TOKEN_ADDRESS.slice(0, 6)}...{REWARD_TOKEN_ADDRESS.slice(-4)}
            </span>
            <button
              className="ml-1 p-1 rounded hover:bg-gray-100"
              title="Copy contract address"
              onClick={() => copyToClipboard(REWARD_TOKEN_ADDRESS)}
              type="button"
            >
              <Copy className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardWalletConnect;
