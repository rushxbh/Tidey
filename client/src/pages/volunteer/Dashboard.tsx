import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Coins, Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Event {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: {
    name: string;
  };
  currentParticipants: number;
  maxParticipants: number;
  status: string;
}

interface UserStats {
  eventsJoined: number;
  totalHours: number;
  aquaCoins: number;
  achievements: number;
}

interface BeachHealthData {
  location: string;
  score: number;
  lastUpdated: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    eventsJoined: 0,
    totalHours: 0,
    aquaCoins: 0,
    achievements: 0
  });
  const [beachHealthData, setBeachHealthData] = useState<BeachHealthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming events
      const eventsResponse = await axios.get('/api/events?status=upcoming&limit=5');
      setUpcomingEvents(eventsResponse.data.events || []);

      // Fetch user statistics
      const statsResponse = await axios.get('/api/users/stats');
      setUserStats(statsResponse.data);

      // Fetch beach health data
      const beachHealthResponse = await axios.get('/api/beach-health/latest');
      setBeachHealthData(beachHealthResponse.data.beaches || [
        { location: "Juhu Beach", score: 78, lastUpdated: "2 hours ago" },
        { location: "Marine Drive", score: 85, lastUpdated: "4 hours ago" },
        { location: "Versova Beach", score: 72, lastUpdated: "1 day ago" },
        { location: "Chowpatty Beach", score: 68, lastUpdated: "6 hours ago" },
      ]);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await axios.post(`/api/events/${eventId}/register`);
      // Refresh events after joining
      fetchDashboardData();
      showSuccessNotification('Successfully registered for event!');
    } catch (err: any) {
      console.error('Error joining event:', err);
      showErrorNotification(err.response?.data?.message || 'Failed to join event');
    }
  };

  const showSuccessNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    notification.innerHTML = `
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const showErrorNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    notification.innerHTML = `
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <div className="flex items-center space-x-2 bg-ocean-50 px-4 py-2 rounded-lg">
          <Coins className="h-5 w-5 text-ocean-600" />
          <span className="font-semibold text-ocean-800">{userStats.aquaCoins} AquaCoins</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Events Joined</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.eventsJoined}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hours Volunteered</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.totalHours}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Achievements</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.achievements}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-ocean-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-ocean-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AquaCoins</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.aquaCoins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Beach Health Index */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Beach Health Index</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {beachHealthData.map((beach, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{beach.location}</h3>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Health Score</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(beach.score)}`}>
                  {beach.score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    beach.score >= 80 ? 'bg-green-500' :
                    beach.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${beach.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Updated {beach.lastUpdated}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming events available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString()} • {event.startTime} - {event.endTime}
                    </p>
                    <p className="text-sm text-gray-600">{event.location.name}</p>
                    <p className="text-xs text-gray-500">
                      {event.currentParticipants}/{event.maxParticipants} participants
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleJoinEvent(event._id)}
                  className="btn-primary"
                  disabled={event.currentParticipants >= event.maxParticipants}
                >
                  {event.currentParticipants >= event.maxParticipants ? 'Full' : 'Join Event'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-gray-900">First Cleanup</h3>
              <p className="text-sm text-gray-600">Completed your first event</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <Trophy className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Team Player</h3>
              <p className="text-sm text-gray-600">Joined 5 team events</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Trophy className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Ocean Guardian</h3>
              <p className="text-sm text-gray-600">Collected 50kg of waste</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;