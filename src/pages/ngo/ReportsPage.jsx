import { useState, useEffect } from 'react'
import { Download, Filter, Calendar, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Mock data
const mockMonthlyData = [
  { name: 'Jan', plastic: 120, glass: 45, metal: 30, organic: 25 },
  { name: 'Feb', plastic: 150, glass: 55, metal: 35, organic: 30 },
  { name: 'Mar', plastic: 180, glass: 60, metal: 40, organic: 35 },
  { name: 'Apr', plastic: 200, glass: 65, metal: 45, organic: 40 },
  { name: 'May', plastic: 220, glass: 70, metal: 50, organic: 45 },
  { name: 'Jun', plastic: 240, glass: 75, metal: 55, organic: 50 },
]

const mockLocationData = [
  { name: 'Juhu Beach', value: 350, color: '#0088ff' },
  { name: 'Versova Beach', value: 300, color: '#00ffbd' },
  { name: 'Dadar Chowpatty', value: 250, color: '#ffb900' },
  { name: 'Girgaon Chowpatty', value: 200, color: '#4caf50' },
  { name: 'Mahim Beach', value: 150, color: '#9c27b0' },
]

const mockReports = [
  {
    id: 1,
    title: 'June 2023 Cleanup Report',
    date: '2023-06-30',
    description: 'Monthly summary of all cleanup activities in June 2023',
    type: 'monthly',
  },
  {
    id: 2,
    title: 'Juhu Beach Q2 2023 Report',
    date: '2023-06-30',
    description: 'Quarterly report for Juhu Beach cleanup activities',
    type: 'location',
  },
  {
    id: 3,
    title: 'Versova Weekend Cleanup - June 18',
    date: '2023-06-18',
    description: 'Detailed report of the Versova Weekend Cleanup event',
    type: 'event',
  },
  {
    id: 4,
    title: 'May 2023 Cleanup Report',
    date: '2023-05-31',
    description: 'Monthly summary of all cleanup activities in May 2023',
    type: 'monthly',
  },
  {
    id: 5,
    title: 'Volunteer Impact Q2 2023',
    date: '2023-06-30',
    description: 'Analysis of volunteer participation and impact in Q2 2023',
    type: 'volunteer',
  },
]

function NgoReportsPage() {
  const [monthlyData, setMonthlyData] = useState([])
  const [locationData, setLocationData] = useState([])
  const [reports, setReports] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [filteredReports, setFilteredReports] = useState([])
  const [dateRange, setDateRange] = useState({
    start: '2023-01-01',
    end: '2023-06-30',
  })

  useEffect(() => {
    // Simulate API calls
    setMonthlyData(mockMonthlyData)
    setLocationData(mockLocationData)
    setReports(mockReports)
    setFilteredReports(mockReports)
  }, [])

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredReports(reports)
    } else {
      setFilteredReports(reports.filter(report => report.type === activeFilter))
    }
  }, [activeFilter, reports])

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateReport = () => {
    // This would trigger a report generation in a real app
    alert('Report generation started. It will be available for download shortly.')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={generateReport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <FileText className="h-5 w-5 mr-2" />
          Generate New Report
        </button>
      </div>

      {/* Date range filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
            <div>
              <label htmlFor="start" className="sr-only">Start Date</label>
              <input
                type="date"
                id="start"
                name="start"
                value={dateRange.start}
                onChange={handleDateRangeChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="end" className="sr-only">End Date</label>
              <input
                type="date"
                id="end"
                name="end"
                value={dateRange.end}
                onChange={handleDateRangeChange}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Waste Collection by Month</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} kg`} />
                  <Legend />
                  <Bar dataKey="plastic" stackId="a" name="Plastic" fill="#0088ff" />
                  <Bar dataKey="glass" stackId="a" name="Glass" fill="#00ffbd" />
                  <Bar dataKey="metal" stackId="a" name="Metal" fill="#ffb900" />
                  <Bar dataKey="organic" stackId="a" name="Organic" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Waste Collection by Location</h2>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} kg`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Available Reports</h2>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'all'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('monthly')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'monthly'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setActiveFilter('location')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'location'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Location
              </button>
              <button
                onClick={() => setActiveFilter('event')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'event'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Event
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <li key={report.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">{report.date}</div>
                      <button
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-12 text-center">
                <p className="text-gray-500">No reports found matching your criteria.</p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="mt-2 text-primary-600 hover:text-primary-500"
                >
                  Clear filters
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NgoReportsPage