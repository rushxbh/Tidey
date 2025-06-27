import { useState } from 'react'
import { MapPin, TrendingUp, Info, RefreshCw, BarChart3, Thermometer, Droplets, Wind } from 'lucide-react'

interface BciDataItem {
  id: string
  beach: { name: string }
  score: number
  calculated_at: string
  temperature?: number
  humidity?: number
  windSpeed?: number
}

const mockBciData: BciDataItem[] = [
  {
    id: '1',
    beach: { name: 'Juhu Beach' },
    score: 65,
    calculated_at: new Date().toISOString(),
    temperature: 28,
    humidity: 75,
    windSpeed: 12
  },
  {
    id: '2',
    beach: { name: 'Versova Beach' },
    score: 80,
    calculated_at: new Date().toISOString(),
    temperature: 26,
    humidity: 70,
    windSpeed: 15
  },
  {
    id: '3',
    beach: { name: 'Dadar Chowpatty' },
    score: 55,
    calculated_at: new Date().toISOString(),
    temperature: 30,
    humidity: 80,
    windSpeed: 8
  },
  {
    id: '4',
    beach: { name: 'Girgaon Chowpatty' },
    score: 60,
    calculated_at: new Date().toISOString(),
    temperature: 29,
    humidity: 78,
    windSpeed: 10
  },
  {
    id: '5',
    beach: { name: 'Mahim Beach' },
    score: 45,
    calculated_at: new Date().toISOString(),
    temperature: 31,
    humidity: 85,
    windSpeed: 6
  }
]

function VolunteerBciPage() {
  const [bciData] = useState<BciDataItem[]>(mockBciData)

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-700 bg-green-100 border-green-200'
    if (score >= 60) return 'text-yellow-700 bg-yellow-100 border-yellow-200'
    if (score >= 40) return 'text-orange-700 bg-orange-100 border-orange-200'
    return 'text-red-700 bg-red-100 border-red-200'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Attention'
  }

  const getScoreGradient = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-green-600'
    if (score >= 60) return 'from-yellow-500 to-yellow-600'
    if (score >= 40) return 'from-orange-500 to-orange-600'
    return 'from-red-500 to-red-600'
  }

  const averageScore = Math.round(bciData.reduce((sum, item) => sum + item.score, 0) / bciData.length)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beach Cleanliness Index</h1>
          <p className="mt-2 text-gray-600">
            Real-time cleanliness scores and environmental data for Mumbai's beaches
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* BCI Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              About the Beach Cleanliness Index
            </h3>
            <div className="text-blue-800">
              <p className="mb-2">
                The BCI is calculated using recent cleanup activity, waste volume, volunteer participation, 
                and time since last cleanup. Scores range from 0-100, with higher scores indicating cleaner beaches.
              </p>
              <p className="text-sm">
                Environmental factors like temperature, humidity, and wind speed also influence beach conditions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Overall Statistics</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{averageScore}</p>
              <p className="text-sm text-gray-500">Average Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {bciData.filter(item => item.score >= 60).length}
              </p>
              <p className="text-sm text-gray-500">Good or Better</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{bciData.length}</p>
              <p className="text-sm text-gray-500">Beaches Monitored</p>
            </div>
          </div>
        </div>
      </div>

      {/* Beach Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bciData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                      {item.beach?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Updated {new Date(item.calculated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Display */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Cleanliness Score</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(item.score)}`}>
                    {getScoreLabel(item.score)}
                  </span>
                </div>
                <div className="relative">
                  <div className="flex items-center justify-center h-24 w-24 mx-auto">
                    <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${getScoreGradient(item.score)} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{item.score}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Environmental Data */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">Temperature</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.temperature}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600">Humidity</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wind className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Wind Speed</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.windSpeed} km/h</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button className="w-full text-center text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200">
                  View detailed analysis →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VolunteerBciPage