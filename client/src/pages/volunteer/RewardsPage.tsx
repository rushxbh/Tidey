import React, { useState, useEffect } from 'react';
import { Gift, Coins, Star, ShoppingBag, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Reward {
  _id: string;
  name: string;
  description: string;
  cost: number;
  category: 'merchandise' | 'experience' | 'donation';
  image: string;
  inStock: boolean;
  stockQuantity?: number;
  rating: number;
  reviews: any[];
  redemptions: any[];
}

const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userCoins, setUserCoins] = useState(0);

  useEffect(() => {
    fetchRewards();
    if (user) {
      setUserCoins(user.aquaCoins || 0);
    }
  }, [filter, page, user]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 12
      };

      if (filter === 'affordable') {
        params.maxCost = userCoins;
      } else if (filter !== 'all') {
        params.category = filter;
      }

      const response = await axios.get('/api/rewards', { params });
      setRewards(response.data.rewards || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      console.error('Error fetching rewards:', err);
      setError('Failed to load rewards');
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
      
      // Update user coins locally
      setUserCoins(prev => prev - reward.cost);
      
      // Refresh rewards to update stock
      fetchRewards();
      
      alert(`Successfully redeemed ${reward.name}!`);
    } catch (err: any) {
      console.error('Error redeeming reward:', err);
      alert(err.response?.data?.message || 'Failed to redeem reward');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'merchandise':
        return 'bg-blue-100 text-blue-800';
      case 'experience':
        return 'bg-purple-100 text-purple-800';
      case 'donation':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (loading && rewards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">AquaStore</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-ocean-50 px-4 py-2 rounded-lg">
            <Coins className="h-5 w-5 text-ocean-600" />
            <span className="font-semibold text-ocean-800">{userCoins} AquaCoins</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="input-field"
          >
            <option value="all">All Rewards</option>
            <option value="affordable">Affordable ({userCoins} coins)</option>
            <option value="merchandise">Merchandise</option>
            <option value="experience">Experiences</option>
            <option value="donation">Donations</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {rewards.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later for new rewards.</p>
        </div>
      ) : (
        <>
          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <div key={reward._id} className="card overflow-hidden">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(reward.category)}`}>
                      {getCategoryText(reward.category)}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{reward.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{reward.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Coins className="h-5 w-5 text-ocean-600 mr-1" />
                      <span className="text-lg font-bold text-ocean-600">{reward.cost}</span>
                    </div>
                    {!reward.inStock && (
                      <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                    )}
                    {reward.stockQuantity !== undefined && reward.inStock && (
                      <span className="text-sm text-gray-500">{reward.stockQuantity} left</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={userCoins < reward.cost || !reward.inStock}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                      userCoins >= reward.cost && reward.inStock
                        ? 'bg-primary-600 hover:bg-primary-700 text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {userCoins < reward.cost ? 'Insufficient Coins' : 
                     !reward.inStock ? 'Out of Stock' : 'Redeem'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
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
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
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
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* How to Earn More */}
      <div className="card bg-gradient-to-r from-primary-50 to-ocean-50">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <Gift className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Need More AquaCoins?</h3>
            <p className="text-gray-600 mb-3">
              Participate in beach cleanup events to earn more coins and unlock amazing rewards!
            </p>
            <button 
              onClick={() => window.location.href = '/volunteer/events'}
              className="btn-primary"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;