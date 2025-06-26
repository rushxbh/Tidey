import { useState } from 'react'
import { Award, Coins } from 'lucide-react'

function VolunteerRewardsPage() {
  const [activeTab, setActiveTab] = useState('badges')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rewards & Achievements</h1>
        <p className="mt-1 text-sm text-gray-500">
          Earn badges for your participation and redeem AquaCoins for rewards.
        </p>
      </div>

      {/* AquaCoins Balance */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Coins className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Your AquaCoins</h2>
                <p className="text-sm text-gray-500">Earn coins by participating in events and logging waste</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">0</p>
              <p className="text-sm text-gray-500">Available Balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('badges')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'badges'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Badges & Progress
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'rewards'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Redeem Rewards
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'badges' && (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No badges yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Participate in events to earn badges and recognition.
              </p>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="text-center py-12">
              <Coins className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rewards available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Earn AquaCoins by participating in events to unlock rewards.
              </p>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your reward and achievement history will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VolunteerRewardsPage