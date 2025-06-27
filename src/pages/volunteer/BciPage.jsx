import { useState } from 'react'
import { MapPin, TrendingUp, Info, RefreshCw, BarChart3 } from 'lucide-react'

const mockBciData = [
  {
    id: '1',
    beach: { name: 'Juhu Beach' },
    score: 65,
    calculated_at: new Date().toISOString()
  },
  {
    id: '2',
    beach: { name: 'Versova Beach' },
    score: 80,
    calculated_at: new Date().toISOString()
  },
  {
    id: '3',
    beach: { name: 'Dadar Chowpatty' },
    score: 55,
    calculated_at: new Date().toISOString()
  },
  {
    id: '4',
    beach: { name: 'Girgaon Chowpatty' },
    score: 60,
    calculated_at: new Date().toISOString()
  },
  {
    id: '5',
    beach: { name: 'Mahim Beach' },
    score: 45,
    calculated_at: new Date().toISOString()
  }
]

function VolunteerBciPage() {
  const [bciData] = useState(mockBciData)

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Attention'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beach Cleanliness Index</h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time cleanliness scores for Mumbai's beaches
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </p>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* BCI Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              About the Beach Cleanliness Index
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                The BCI is calculated using recent cleanup activity, waste volume, volunteer participation, 
                and time since last cleanup. Scores range from 0-100, with higher scores indicating cleaner beaches.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Beach Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bciData.map((item) => (
          <div
            key={item.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.beach?.name}
                    </dt>
                    <dd className="flex items-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {item.score}
                      </div>
                      <div className="ml-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(item.score)}`}>
                          {getScoreLabel(item.score)}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Updated {new Date(item.calculated_at).toLocaleDateString()}</span>
                  <span className="text-primary-600 hover:text-primary-500">
                    View details →
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Overall Statistics</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {Math.round(bciData.reduce((sum, item) => sum + item.score, 0) / bciData.length)}
              </p>
              <p className="text-sm text-gray-500">Average Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {bciData.filter(item => item.score >= 60).length}
              </p>
              <p className="text-sm text-gray-500">Good or Better</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary-500" />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{bciData.length}</p>
              <p className="text-sm text-gray-500">Beaches Monitored</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VolunteerBciPage