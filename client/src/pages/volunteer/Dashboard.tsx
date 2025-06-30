import React from 'react';
import { Calendar, MapPin, Users, Coins, Trophy, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <div className="flex items-center space-x-2 bg-ocean-50 px-4 py-2 rounded-lg">
          <Coins className="h-5 w-5 text-ocean-600" />
          <span className="font-semibold text-ocean-800">1,250 AquaCoins</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Events Joined</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
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
              <p className="text-2xl font-bold text-gray-900">48</p>
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
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-ocean-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-ocean-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Impact Score</p>
              <p className="text-2xl font-bold text-gray-900">95</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MapPin className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Santa Monica Beach Cleanup</h3>
                <p className="text-sm text-gray-600">Tomorrow, 9:00 AM - 12:00 PM</p>
              </div>
            </div>
            <button className="btn-primary">Join Event</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MapPin className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Venice Beach Conservation</h3>
                <p className="text-sm text-gray-600">Saturday, 8:00 AM - 11:00 AM</p>
              </div>
            </div>
            <button className="btn-primary">Join Event</button>
          </div>
        </div>
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