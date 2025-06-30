import React, { useState } from 'react';
import { Gift, Coins, Star, ShoppingBag, Filter } from 'lucide-react';

const RewardsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [userCoins] = useState(1250);

  const rewards = [
    {
      id: 1,
      name: 'Eco-Friendly Water Bottle',
      description: 'Stainless steel water bottle made from recycled materials',
      cost: 500,
      category: 'merchandise',
      image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: true,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Beach Cleanup T-Shirt',
      description: 'Organic cotton t-shirt with ocean conservation message',
      cost: 300,
      category: 'merchandise',
      image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: true,
      rating: 4.6
    },
    {
      id: 3,
      name: 'Marine Biology Workshop',
      description: '2-hour educational workshop about marine ecosystems',
      cost: 800,
      category: 'experience',
      image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: true,
      rating: 4.9
    },
    {
      id: 4,
      name: 'Reusable Shopping Bag Set',
      description: 'Set of 3 eco-friendly shopping bags',
      cost: 200,
      category: 'merchandise',
      image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: true,
      rating: 4.5
    },
    {
      id: 5,
      name: 'Ocean Documentary Screening',
      description: 'Private screening of award-winning ocean documentary',
      cost: 600,
      category: 'experience',
      image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: false,
      rating: 4.7
    },
    {
      id: 6,
      name: 'Bamboo Utensil Set',
      description: 'Portable bamboo utensil set with carrying case',
      cost: 150,
      category: 'merchandise',
      image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400',
      inStock: true,
      rating: 4.4
    }
  ];

  const filteredRewards = rewards.filter(reward => {
    if (filter === 'all') return true;
    if (filter === 'affordable') return reward.cost <= userCoins;
    return reward.category === filter;
  });

  const handleRedeem = (reward: any) => {
    if (userCoins >= reward.cost && reward.inStock) {
      // Redeem logic here
      alert(`Redeemed ${reward.name} for ${reward.cost} AquaCoins!`);
    }
  };

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
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Rewards</option>
            <option value="affordable">Affordable ({userCoins} coins)</option>
            <option value="merchandise">Merchandise</option>
            <option value="experience">Experiences</option>
          </select>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => (
          <div key={reward.id} className="card overflow-hidden">
            <img
              src={reward.image}
              alt={reward.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  reward.category === 'merchandise' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {reward.category === 'merchandise' ? 'Merchandise' : 'Experience'}
                </span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{reward.rating}</span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{reward.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Coins className="h-5 w-5 text-ocean-600 mr-1" />
                  <span className="text-lg font-bold text-ocean-600">{reward.cost}</span>
                </div>
                {!reward.inStock && (
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
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
            <button className="btn-primary">
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