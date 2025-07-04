import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useBalanceOfAQUA } from "./useAquaCoin";
import { useAuth } from "../contexts/AuthContext";

export function useFetchAQUA(setError?: (msg: string) => void) {
  const { user, updateUser } = useAuth();
  const { address } = useAccount();

  const {
    tokenBalance: fallbackTokenBalance,
    tokenSymbol: fallbackTokenSymbol,
    tokenDecimals: fallbackTokenDecimals,
  } = useBalanceOfAQUA();

  const isConnected = user?.walletConnected || false;

  useEffect(() => {
    const tryFetchAqua = async () => {
      if (
        address &&
        (!user?.walletAddress ||
          user?.walletAddress !== address ||
          !isConnected ||
          user?.AQUABalance === undefined ||
          user?.AQUABalance === 0 ||
          user?.AQUABalance === null ||
          !user?.AQUASymbol ||
          user?.AQUASymbol === "" ||
          user?.AQUADecimal === undefined ||
          user?.AQUADecimal === null)
      ) {
        try {
          if (!user?.walletAddress || user.walletAddress !== address) {
            updateUser({ walletAddress: address });
          }

          if (
            fallbackTokenBalance !== undefined &&
            fallbackTokenSymbol !== undefined &&
            fallbackTokenDecimals !== undefined
          ) {
            updateUser({
              walletAddress: address,
              AQUABalance:
                typeof fallbackTokenBalance === "bigint"
                  ? Number(fallbackTokenBalance) /
                    Math.pow(10, Number(fallbackTokenDecimals))
                  : Number(fallbackTokenBalance),
              AQUASymbol: String(fallbackTokenSymbol),
              AQUADecimal: Number(fallbackTokenDecimals),
              walletConnected: true,
            });
          }
        } catch (err) {
          if (setError)
            setError(
              "Error connecting to AquaCoin contract. Please try again."
            );
        }
      } else if (!address && user?.walletConnected) {
        updateUser({
          walletAddress: "",
          AQUABalance: undefined,
          AQUASymbol: undefined,
          AQUADecimal: undefined,
          walletConnected: false,
        });
      }
    };

    tryFetchAqua();
    // eslint-disable-next-line
  }, [
    address,
    isConnected,
    user?.walletAddress,
    user?.AQUABalance,
    user?.AQUASymbol,
    user?.AQUADecimal,
    fallbackTokenBalance,
    fallbackTokenSymbol,
    fallbackTokenDecimals,
    updateUser,
    user?.walletConnected,
  ]);
}
