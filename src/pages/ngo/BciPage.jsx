import { useState } from 'react'
import { MapPin, TrendingUp, Download, RefreshCw, BarChart3, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

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

const mockAnalyticsData = {
  averageScores: [
    { name: 'Juhu Beach', average: 65 },
    { name: 'Versova Beach', average: 80 },
    { name: 'Dadar Chowpatty', average: 55 },
    { name: 'Girgaon Chowpatty', average: 60 },
    { name: 'Mahim Beach', average: 45 }
  ],
  distributionData: [
    { name: 'Excellent (80-100)', value: 1, color: '#10b981' },
    { name: 'Good (60-79)', value: 2, color: '#f59e0b' },
    { name: 'Fair (40-59)', value: 2, color: '#f97316' },
    { name: 'Needs Attention (0-39)', value: 0, color: '#ef4444' }
  ],
  totalReadings: 5,
  overallAverage: 61
}

function NgoBciPage() {
  const [bciData] = useState(mockBciData)
  const [analyticsData] = useState(mockAnalyticsData)

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

  const exportData = () => {
    alert('Export functionality would be implemented here')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beach Cleanliness Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive BCI analysis and trends across all managed beaches
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </p>
          <button
            onClick={exportData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overall Average</dt>
                  <dd className="text-lg font-medium text-gray-900">{analyticsData.overallAverage}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Beaches Monitored</dt>
                  <dd className="text-lg font-medium text-gray-900">{bciData.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Readings</dt>
                  <dd className="text-lg font-medium text-gray-900">{analyticsData.totalReadings}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Excellent Scores</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analyticsData.distributionData.find(d => d.name.includes('Excellent'))?.value || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Average Scores by Beach */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Average Scores by Beach</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.averageScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [value, 'Average Score']} />
                  <Bar dataKey="average" fill="#0088ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Score Distribution</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Readings']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Beach Details Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Current Beach Status</h2>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beach
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bciData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {item.beach?.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.score}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(item.score)}`}>
                        {getScoreLabel(item.score)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.calculated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NgoBciPage