import React, { useState, useEffect } from 'react';
import { Trophy, Coins, Star, Target, Award, Gift } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: 'participation' | 'impact' | 'leadership' | 'special';
  criteria: {
    type: 'events_joined' | 'hours_volunteered' | 'waste_collected' | 'custom';
    value: number;
    operator: 'gte' | 'lte' | 'eq';
  };
  reward: {
    aquaCoins: number;
    nftMetadata?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  userProgress?: {
    progress: number;
    completed: boolean;
    completedAt?: string;
  };
}

const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [completedAchievements, setCompletedAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchAchievements();
    fetchCompletedAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/achievements');
      setAchievements(response.data.achievements || []);
    } catch (err: any) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedAchievements = async () => {
    try {
      const response = await axios.get('/api/achievements/completed');
      setCompletedAchievements(response.data.achievements || []);
    } catch (err: any) {
      console.error('Error fetching completed achievements:', err);
    }
  };

  const checkProgress = async () => {
    try {
      const response = await axios.post('/api/achievements/check-progress');
      if (response.data.newlyCompleted.length > 0) {
        const newAchievements = response.data.newlyCompleted;
        const totalCoins = newAchievements.reduce((sum: number, ach: any) => sum + ach.coinsAwarded, 0);
        alert(`Congratulations! You've earned ${newAchievements.length} new achievement(s) and ${totalCoins} AquaCoins!`);
        fetchAchievements();
        fetchCompletedAchievements();
      }
    } catch (err: any) {
      console.error('Error checking progress:', err);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50';
      case 'rare':
        return 'border-blue-300 bg-blue-50';
      case 'epic':
        return 'border-purple-300 bg-purple-50';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-700';
      case 'rare':
        return 'text-blue-700';
      case 'epic':
        return 'text-purple-700';
      case 'legendary':
        return 'text-yellow-700';
      default:
        return 'text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'participation':
        return <Target className="h-5 w-5" />;
      case 'impact':
        return <Award className="h-5 w-5" />;
      case 'leadership':
        return <Star className="h-5 w-5" />;
      case 'special':
        return <Gift className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (!achievement.userProgress) return 0;
    return Math.min((achievement.userProgress.progress / achievement.criteria.value) * 100, 100);
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-ocean-50 px-4 py-2 rounded-lg">
            <Coins className="h-5 w-5 text-ocean-600" />
            <span className="font-semibold text-ocean-800">{user?.aquaCoins || 0} AquaCoins</span>
          </div>
          <button
            onClick={checkProgress}
            className="btn-primary"
          >
            Check Progress
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Achievements</p>
              <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedAchievements.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {achievements.filter(a => a.userProgress && a.userProgress.progress > 0 && !a.userProgress.completed).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-ocean-100 rounded-lg">
              <Coins className="h-6 w-6 text-ocean-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Coins Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedAchievements.reduce((sum, ach) => sum + (ach.reward?.aquaCoins || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Achievements
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
        </div>

        {activeTab === 'all' && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="all">All Categories</option>
            <option value="participation">Participation</option>
            <option value="impact">Impact</option>
            <option value="leadership">Leadership</option>
            <option value="special">Special</option>
          </select>
        )}
      </div>

      {/* Achievements Grid */}
      {activeTab === 'all' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement._id}
              className={`card border-2 ${getRarityColor(achievement.rarity)} ${
                achievement.userProgress?.completed ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                    {getCategoryIcon(achievement.category)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{achievement.name}</h3>
                    <p className={`text-xs font-medium ${getRarityTextColor(achievement.rarity)}`}>
                      {achievement.rarity.toUpperCase()}
                    </p>
                  </div>
                </div>
                {achievement.userProgress?.completed && (
                  <div className="p-1 bg-green-100 rounded-full">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {achievement.userProgress?.progress || 0} / {achievement.criteria.value}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      achievement.userProgress?.completed ? 'bg-green-500' : 'bg-primary-600'
                    }`}
                    style={{ width: `${getProgressPercentage(achievement)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Coins className="h-4 w-4 text-ocean-600" />
                    <span className="text-sm font-medium text-ocean-600">
                      {achievement.reward.aquaCoins} coins
                    </span>
                  </div>
                  {achievement.userProgress?.completed && (
                    <span className="text-xs text-green-600 font-medium">
                      Completed {new Date(achievement.userProgress.completedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedAchievements.map((userAchievement) => {
            const achievement = userAchievement.name as any;
            return (
              <div
                key={userAchievement._id}
                className={`card border-2 ring-2 ring-green-500 ${getRarityColor(achievement.rarity)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getRarityColor(achievement.rarity)}`}>
                      {getCategoryIcon(achievement.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{achievement.name}</h3>
                      <p className={`text-xs font-medium ${getRarityTextColor(achievement.rarity)}`}>
                        {achievement.rarity.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="p-1 bg-green-100 rounded-full">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

                <div className="space-y-3">
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-green-500 w-full"></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Coins className="h-4 w-4 text-ocean-600" />
                      <span className="text-sm font-medium text-ocean-600">
                        {achievement.reward.aquaCoins} coins earned
                      </span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      {new Date(achievement.userProgress?.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'all' && filteredAchievements.length === 0) || 
        (activeTab === 'completed' && completedAchievements.length === 0)) && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'all' ? 'No achievements found' : 'No completed achievements yet'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'all' 
              ? 'Try adjusting your filters or check back later for new achievements.'
              : 'Start participating in events to earn your first achievements!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;