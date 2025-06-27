import { useState } from 'react'
import { Award, Coins, Gift, Star, Trophy, Target, Lock, CheckCircle } from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: any
  color: string
  earned: boolean
  progress?: number
  requirement?: string
}

interface Reward {
  id: string
  name: string
  description: string
  cost: number
  category: string
  available: boolean
  image?: string
}

interface Transaction {
  id: string
  type: 'earned' | 'spent'
  amount: number
  description: string
  date: string
}

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first beach cleanup',
    icon: Star,
    color: 'from-blue-500 to-blue-600',
    earned: false,
    progress: 0,
    requirement: 'Join 1 cleanup event'
  },
  {
    id: '2',
    name: 'Beach Guardian',
    description: 'Participate in 5 cleanup events',
    icon: Award,
    color: 'from-green-500 to-green-600',
    earned: false,
    progress: 0,
    requirement: 'Join 5 cleanup events'
  },
  {
    id: '3',
    name: 'Waste Warrior',
    description: 'Collect 50kg of waste',
    icon: Trophy,
    color: 'from-yellow-500 to-yellow-600',
    earned: false,
    progress: 0,
    requirement: 'Collect 50kg of waste'
  },
  {
    id: '4',
    name: 'Ocean Champion',
    description: 'Complete 20 cleanup events',
    icon: Target,
    color: 'from-purple-500 to-purple-600',
    earned: false,
    progress: 0,
    requirement: 'Join 20 cleanup events'
  }
]

const mockRewards: Reward[] = [
  {
    id: '1',
    name: 'Eco-Friendly Water Bottle',
    description: 'Stainless steel water bottle made from recycled materials',
    cost: 100,
    category: 'Merchandise',
    available: false
  },
  {
    id: '2',
    name: 'Organic Cotton T-Shirt',
    description: 'Tidewy branded t-shirt made from 100% organic cotton',
    cost: 150,
    category: 'Merchandise',
    available: false
  },
  {
    id: '3',
    name: 'Beach Cleanup Kit',
    description: 'Professional cleanup tools including gloves, bags, and picker',
    cost: 200,
    category: 'Equipment',
    available: false
  },
  {
    id: '4',
    name: 'Tree Planting Certificate',
    description: 'Plant a tree in your name through our partner organizations',
    cost: 75,
    category: 'Environmental',
    available: false
  },
  {
    id: '5',
    name: 'Eco Workshop Access',
    description: 'Access to exclusive environmental workshops and webinars',
    cost: 50,
    category: 'Education',
    available: false
  },
  {
    id: '6',
    name: 'Beach Adoption Certificate',
    description: 'Symbolically adopt a section of beach for one month',
    cost: 300,
    category: 'Environmental',
    available: false
  }
]

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'earned',
    amount: 50,
    description: 'Completed Juhu Beach Cleanup',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    type: 'earned',
    amount: 25,
    description: 'Logged waste collection data',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    type: 'earned',
    amount: 30,
    description: 'Referred a new volunteer',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
]

function VolunteerRewardsPage() {
  const [activeTab, setActiveTab] = useState<'badges' | 'rewards' | 'history'>('badges')
  const [badges] = useState<Badge[]>(mockBadges)
  const [rewards] = useState<Reward[]>(mockRewards)
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [aquaCoins] = useState(0)

  const categories = ['All', 'Merchandise', 'Equipment', 'Environmental', 'Education']
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredRewards = selectedCategory === 'All' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory)

  const canAfford = (cost: number) => aquaCoins >= cost

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rewards & Achievements</h1>
        <p className="mt-2 text-gray-600">
          Earn badges for your participation and redeem AquaCoins for eco-friendly rewards.
        </p>
      </div>

      {/* AquaCoins Balance */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-6">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Your AquaCoins</h2>
              <p className="text-purple-100">Earn coins by participating in events and logging waste</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{aquaCoins}</p>
            <p className="text-purple-100">Available Balance</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('badges')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'badges'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Award className="h-5 w-5 mx-auto mb-1" />
              Badges & Progress
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'rewards'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Gift className="h-5 w-5 mx-auto mb-1" />
              Redeem Rewards
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Coins className="h-5 w-5 mx-auto mb-1" />
              Transaction History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'badges' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Achievement Badges</h3>
                <p className="text-gray-600">Complete activities to unlock badges and show off your environmental impact.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                      badge.earned
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50 opacity-75'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg mr-4`}>
                        <badge.icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{badge.name}</h4>
                          {badge.earned && (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          )}
                          {!badge.earned && (
                            <Lock className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{badge.description}</p>
                        {badge.requirement && (
                          <p className="text-sm text-gray-500 mb-3">{badge.requirement}</p>
                        )}
                        {!badge.earned && badge.progress !== undefined && (
                          <div>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{badge.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full bg-gradient-to-r ${badge.color}`}
                                style={{ width: `${badge.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Redeem Rewards</h3>
                <p className="text-gray-600">Use your AquaCoins to get eco-friendly rewards and support environmental causes.</p>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                      canAfford(reward.cost) && reward.available
                        ? 'border-green-200 hover:shadow-lg'
                        : 'border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          reward.category === 'Merchandise' ? 'bg-blue-100 text-blue-800' :
                          reward.category === 'Equipment' ? 'bg-green-100 text-green-800' :
                          reward.category === 'Environmental' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {reward.category}
                        </span>
                        <div className="flex items-center">
                          <Coins className="h-4 w-4 text-purple-500 mr-1" />
                          <span className="font-semibold text-gray-900">{reward.cost}</span>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{reward.name}</h4>
                      <p className="text-gray-600 mb-4">{reward.description}</p>
                      
                      <button
                        disabled={!canAfford(reward.cost) || !reward.available}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                          canAfford(reward.cost) && reward.available
                            ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {!reward.available ? 'Coming Soon' :
                         !canAfford(reward.cost) ? 'Insufficient AquaCoins' :
                         'Redeem Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction History</h3>
                <p className="text-gray-600">Track how you've earned and spent your AquaCoins.</p>
              </div>
              
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center mr-4 ${
                          transaction.type === 'earned' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <Coins className={`h-6 w-6 ${
                            transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Coins className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                  <p className="text-gray-500">
                    Start participating in events to earn your first AquaCoins!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VolunteerRewardsPage