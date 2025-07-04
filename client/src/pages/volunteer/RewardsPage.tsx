import React, { useState, useEffect } from "react";
import axios from "axios";
import WalletRegister from "../../components/registerWallet";
import { Gift, Coins, Star, ShoppingBag, Filter, Copy } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useAccount } from "wagmi";
import { useFetchAQUA } from "../../hooks/fetchAQUA";
interface Reward {
  _id: string;
  name: string;
  description: string;
  cost: number;
  category: "merchandise" | "experience" | "donation";
  image: string;
  inStock: boolean;
  stockQuantity?: number;
  rating: number;
  reviews: any[];
  redemptions: any[];
}

const RewardsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { address } = useAccount();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [walletEmpty, setWalletEmpty] = useState<boolean | null>(null);
  useFetchAQUA(setError);
  // Replace direct contract reading with AuthContext data
  const tokenBalance = user?.AQUABalance ?? 0;
  const tokenSymbol = user?.AQUASymbol || "AQUA";
  const tokenDecimals = user?.AQUADecimal ?? 4;
  const isConnected = user?.walletConnected || false;
  const balanceLoading = typeof user?.AQUABalance === "undefined";

  const formatTokenBalance = (
    balance: number | undefined,
    decimals: number | undefined
  ) => {
    if (!balance || decimals === undefined) return "0.00";
    const divisor = 10 ** decimals;
    const formatted = Number(balance) / divisor;
    return formatted.toFixed(2);
  };
  // Check wallet status from backend
  useEffect(() => {
    const checkWallet = async () => {
      if (!user?._id) {
        console.log("No user ID available");
        return;
      }

      try {
        console.log(`Checking wallet for user: ${user._id}`);
        // Fix: Use the correct API path
        const res = await axios.get(
          `/api/wallet-register/is-wallet-empty/${user._id}`
        );
        console.log("API response:", res.data);
        setWalletEmpty(res.data.isEmpty);
      } catch (err) {
        console.error("Error checking wallet:", err);
        // Set a default value to avoid infinite loading on error
        setWalletEmpty(false);
      }
    };
    checkWallet();
  }, [user?._id]);

  // Use AuthContext balance for userCoins
  const userCoins = isConnected
    ? Number(formatTokenBalance(tokenBalance, tokenDecimals))
    : 0;

  useEffect(() => {
    fetchRewards();
  }, [filter, page, tokenBalance, isConnected]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 12,
      };

      if (filter === "affordable") {
        params.maxCost = userCoins;
      } else if (filter !== "all") {
        params.category = filter;
      }

      const response = await axios.get("/api/rewards", { params });
      setRewards(response.data.rewards || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      console.error("Error fetching rewards:", err);
      setError("Failed to load rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: Reward) => {
    if (userCoins < reward.cost || !reward.inStock) {
      return;
    }

    try {
      await axios.post(`/api/rewards/${reward._id}/redeem`);

      // Refresh rewards to update stock
      fetchRewards();

      alert(`Successfully redeemed ${reward.name}!`);
    } catch (err: any) {
      console.error("Error redeeming reward:", err);
      alert(err.response?.data?.message || "Failed to redeem reward");
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "merchandise":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "experience":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "donation":
        return "bg-green-50 text-green-700 border border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getCategoryText = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Loading state for initial fetch or subsequent fetches
  if (loading && rewards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">
            Fetching amazing rewards...
          </p>
        </div>
      </div>
    );
  }
  if (walletEmpty === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">
            Checking wallet status...
          </p>
        </div>
      </div>
    );
  }
  // Show WalletRegister if walletAddress is empty or "0"
  if (walletEmpty) {
    console.log(walletEmpty);
    
    return <WalletRegister />;
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-gray-200">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            AquaStore
          </h1>
          <div className="flex items-center space-x-4 bg-ocean-50 px-5 py-3 rounded-xl shadow-sm border border-ocean-100">
            <Coins className="h-6 w-6 text-ocean-600" />
            {isConnected ? (
              balanceLoading ? (
                <span className="font-semibold text-ocean-800 text-lg">
                  Loading...
                </span>
              ) : (
                <span className="font-bold text-ocean-800 text-2xl flex items-center gap-2">
                  {formatTokenBalance(tokenBalance, tokenDecimals)}{" "}
                  <span className="text-xl">{tokenSymbol}</span>
                  <button
                    className="ml-2 p-1.5 rounded-full hover:bg-ocean-100 transition-colors duration-200"
                    title="Copy balance"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `${formatTokenBalance(
                          tokenBalance,
                          tokenDecimals
                        )} ${tokenSymbol}`
                      )
                    }
                    type="button"
                  >
                    <Copy className="w-4 h-4 text-ocean-600" />
                  </button>
                </span>
              )
            ) : (
              <span className="font-semibold text-ocean-800 text-lg">
                Connect Wallet
              </span>
            )}
          </div>
        </header>

        {/* Filter Section */}
        <section className="flex items-center gap-4">
          <Filter className="h-6 w-6 text-gray-500" />
          <label htmlFor="reward-filter" className="sr-only">
            Filter rewards
          </label>
          <div className="relative inline-block w-auto">
            <select
              id="reward-filter"
              aria-label="Filter rewards"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="appearance-none block w-full bg-white border border-gray-300 rounded-xl py-3 pl-4 pr-10 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Rewards</option>
              <option value="affordable">
                Affordable ({userCoins.toFixed(2)} coins)
              </option>
              <option value="merchandise">Merchandise</option>
              <option value="experience">Experiences</option>
              <option value="donation">Donations</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-700">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
            <p className="text-red-700 font-medium text-center">{error}</p>
          </div>
        )}

        {/* Rewards Grid */}
        {rewards.length === 0 && !loading ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <Gift className="h-20 w-20 text-gray-400 mx-auto mb-6 animate-bounce" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No rewards found
            </h3>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              It looks like there are no rewards matching your current filters.
              Try adjusting them or check back later for new and exciting items!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rewards.map((reward) => (
                <div
                  key={reward._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-56">
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="w-full h-full object-cover rounded-t-2xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=600&h=400"; // Higher res fallback
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(
                          reward.category
                        )}`}
                      >
                        {getCategoryText(reward.category)}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {reward.name}
                      </h3>
                      <div className="flex items-center text-gray-600">
                        <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                        <span className="text-base font-medium">
                          {reward.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                      {reward.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <Coins className="h-6 w-6 text-ocean-600 mr-1" />
                        <span className="text-2xl font-extrabold text-ocean-600">
                          {reward.cost}
                        </span>
                      </div>
                      <div className="text-right">
                        {!reward.inStock && (
                          <span className="text-sm text-red-600 font-medium block">
                            Out of Stock
                          </span>
                        )}
                        {reward.stockQuantity !== undefined &&
                          reward.inStock && (
                            <span className="text-sm text-gray-500">
                              {reward.stockQuantity} left
                            </span>
                          )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={userCoins < reward.cost || !reward.inStock}
                      className={`mt-6 w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2
                        ${
                          userCoins >= reward.cost && reward.inStock
                            ? "bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed shadow-inner"
                        }`}
                    >
                      <ShoppingBag className="h-5 w-5" />
                      {userCoins < reward.cost
                        ? "Insufficient Coins"
                        : !reward.inStock
                        ? "Out of Stock"
                        : "Redeem Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 mt-12">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-5 py-2.5 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Previous
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2.5 text-base font-medium rounded-xl transition-colors duration-200 shadow-sm
                          ${
                            page === pageNum
                              ? "bg-primary-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Call to Action Section */}
        <section className="bg-gradient-to-br from-primary-50 to-ocean-50 shadow-lg rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 mt-12 border border-primary-100">
          <div className="p-4 bg-primary-100 rounded-xl shrink-0">
            <Gift className="h-10 w-10 text-primary-600" />
          </div>
          <div className="text-center md:text-left flex-grow">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Want More AquaCoins?
            </h3>
            <p className="text-gray-700 mb-4 text-lg">
              Participate in beach cleanup events to earn more coins and unlock
              even more amazing rewards!
            </p>
            <button
              onClick={() => (window.location.href = "/volunteer/events")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold text-lg hover:bg-primary-700 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              <ShoppingBag className="h-5 w-5" />
              Browse Events
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RewardsPage;
