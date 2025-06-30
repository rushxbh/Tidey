import React from 'react';
import { Calendar, Users, TrendingUp, MapPin, Plus, BarChart3 } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
        <button className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
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
              <p className="text-2xl font-bold text-gray-900">342</p>
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
              <p className="text-2xl font-bold text-gray-900">2.5T</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-ocean-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-ocean-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Beach Health Score</p>
              <p className="text-2xl font-bold text-gray-900">87</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Events</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MapPin className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Santa Monica Beach Cleanup</h3>
                <p className="text-sm text-gray-600">25 volunteers • 150kg waste collected</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Completed
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-100 rounded-lg">
                <MapPin className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Venice Beach Conservation</h3>
                <p className="text-sm text-gray-600">18 volunteers registered</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Upcoming
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Volunteer Engagement</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Registrations</span>
              <span className="font-semibold text-green-600">+12 this week</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Volunteers</span>
              <span className="font-semibold text-gray-900">89%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Repeat Participants</span>
              <span className="font-semibold text-gray-900">67%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Impact Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Beaches Cleaned</span>
              <span className="font-semibold text-gray-900">15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Volunteer Hours</span>
              <span className="font-semibold text-gray-900">1,248</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Community Reach</span>
              <span className="font-semibold text-gray-900">2,500+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;