import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, MapPin, Calendar, Download, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface AnalyticsData {
  totalEvents: number;
  totalVolunteers: number;
  totalWasteCollected: number;
  averageBeachHealth: number;
  monthlyTrends: {
    month: string;
    events: number;
    volunteers: number;
    waste: number;
  }[];
  topLocations: {
    name: string;
    events: number;
    waste: number;
    healthScore: number;
  }[];
  volunteerEngagement: {
    newVolunteers: number;
    returningVolunteers: number;
    averageHours: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics/ngo?timeRange=${timeRange}`);
      setAnalytics(response.data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      // Mock data for demo
      setAnalytics({
        totalEvents: 24,
        totalVolunteers: 156,
        totalWasteCollected: 2340,
        averageBeachHealth: 78,
        monthlyTrends: [
          { month: 'Jan', events: 3, volunteers: 45, waste: 320 },
          { month: 'Feb', events: 4, volunteers: 52, waste: 410 },
          { month: 'Mar', events: 5, volunteers: 68, waste: 520 },
          { month: 'Apr', events: 4, volunteers: 61, waste: 480 },
          { month: 'May', events: 6, volunteers: 78, waste: 650 },
          { month: 'Jun', events: 2, volunteers: 34, waste: 280 }
        ],
        topLocations: [
          { name: 'Juhu Beach', events: 8, waste: 890, healthScore: 82 },
          { name: 'Marine Drive', events: 6, waste: 650, healthScore: 78 },
          { name: 'Versova Beach', events: 5, waste: 520, healthScore: 75 },
          { name: 'Chowpatty Beach', events: 5, waste: 480, healthScore: 72 }
        ],
        volunteerEngagement: {
          newVolunteers: 45,
          returningVolunteers: 111,
          averageHours: 3.2
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Events', analytics.totalEvents],
      ['Total Volunteers', analytics.totalVolunteers],
      ['Total Waste Collected (kg)', analytics.totalWasteCollected],
      ['Average Beach Health Score', analytics.averageBeachHealth],
      [''],
      ['Monthly Trends'],
      ['Month', 'Events', 'Volunteers', 'Waste (kg)'],
      ...analytics.monthlyTrends.map(trend => [trend.month, trend.events, trend.volunteers, trend.waste])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tidewy-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Analytics will appear here once you have event data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button onClick={exportData} className="btn-primary">
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalVolunteers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waste Collected</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalWasteCollected}kg</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-ocean-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-ocean-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Beach Health</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageBeachHealth}/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Monthly Trends</h3>
        <div className="space-y-6">
          {/* Events Trend */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Events per Month</h4>
            <div className="flex items-end space-x-2 h-32">
              {analytics.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-600 rounded-t"
                    style={{ height: `${(trend.events / Math.max(...analytics.monthlyTrends.map(t => t.events))) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{trend.month}</span>
                  <span className="text-xs font-medium text-gray-900">{trend.events}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Volunteers Trend */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Volunteers per Month</h4>
            <div className="flex items-end space-x-2 h-32">
              {analytics.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-600 rounded-t"
                    style={{ height: `${(trend.volunteers / Math.max(...analytics.monthlyTrends.map(t => t.volunteers))) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{trend.month}</span>
                  <span className="text-xs font-medium text-gray-900">{trend.volunteers}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Waste Collection Trend */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Waste Collected per Month (kg)</h4>
            <div className="flex items-end space-x-2 h-32">
              {analytics.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-yellow-600 rounded-t"
                    style={{ height: `${(trend.waste / Math.max(...analytics.monthlyTrends.map(t => t.waste))) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">{trend.month}</span>
                  <span className="text-xs font-medium text-gray-900">{trend.waste}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Cleanup Locations</h3>
          <div className="space-y-4">
            {analytics.topLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{location.name}</h4>
                    <p className="text-sm text-gray-600">{location.events} events</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{location.waste}kg</div>
                  <div className="text-sm text-gray-600">Health: {location.healthScore}/100</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Volunteer Engagement</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Volunteers</span>
              <span className="text-2xl font-bold text-green-600">{analytics.volunteerEngagement.newVolunteers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Returning Volunteers</span>
              <span className="text-2xl font-bold text-blue-600">{analytics.volunteerEngagement.returningVolunteers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Hours per Volunteer</span>
              <span className="text-2xl font-bold text-purple-600">{analytics.volunteerEngagement.averageHours}h</span>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Volunteer Retention</h4>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full"
                  style={{ 
                    width: `${(analytics.volunteerEngagement.returningVolunteers / analytics.totalVolunteers) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {Math.round((analytics.volunteerEngagement.returningVolunteers / analytics.totalVolunteers) * 100)}% retention rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Beach Health Index Trends */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Beach Health Index Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.topLocations.map((location, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{location.name}</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Health Score</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  location.healthScore >= 80 ? 'bg-green-100 text-green-800' :
                  location.healthScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {location.healthScore}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    location.healthScore >= 80 ? 'bg-green-500' :
                    location.healthScore >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${location.healthScore}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;