import React, { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, MapPin, Plus, BarChart3, Edit, Trash2 } from 'lucide-react';
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
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  wasteCollected?: number;
}

interface NGOStats {
  totalEvents: number;
  activeEvents: number;
  totalVolunteers: number;
  totalWasteCollected: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<NGOStats>({
    totalEvents: 0,
    activeEvents: 0,
    totalVolunteers: 0,
    totalWasteCollected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch NGO statistics
      const statsResponse = await axios.get('/api/users/stats');
      setStats(statsResponse.data);

      // Fetch recent events (limit to 5 for dashboard)
      const eventsResponse = await axios.get('/api/events?limit=5');
      setEvents(eventsResponse.data.events || []);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await axios.delete(`/api/events/${eventId}`);
      fetchDashboardData(); // Refresh data
      alert('Event deleted successfully');
    } catch (err: any) {
      console.error('Error deleting event:', err);
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <h1 className="text-3xl font-bold text-gray-900">NGO Dashboard</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
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
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteers}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalWasteCollected}kg</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-ocean-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-ocean-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
          <button 
            onClick={() => window.location.href = '/ngo/events'}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </button>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No events created yet</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-2 btn-primary"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
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
                      {event.wasteCollected && ` • ${event.wasteCollected}kg waste collected`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                  <button
                    onClick={() => window.location.href = `/ngo/events/${event._id}/edit`}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Volunteer Engagement</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Participants</span>
              <span className="font-semibold text-green-600">
                {stats.totalEvents > 0 ? Math.round(stats.totalVolunteers / stats.totalEvents) : 0} per event
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Events</span>
              <span className="font-semibold text-gray-900">{stats.activeEvents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed Events</span>
              <span className="font-semibold text-gray-900">{stats.totalEvents - stats.activeEvents}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Impact Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Events</span>
              <span className="font-semibold text-gray-900">{stats.totalEvents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Volunteer Hours</span>
              <span className="font-semibold text-gray-900">
                {Math.round(stats.totalVolunteers * 3)} est.
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Environmental Impact</span>
              <span className="font-semibold text-gray-900">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

// Create Event Modal Component
const CreateEventModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationName: '',
    locationAddress: '',
    latitude: '',
    longitude: '',
    date: '',
    startTime: '',
    endTime: '',
    maxParticipants: '',
    requirements: '',
    providedEquipment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: {
          name: formData.locationName,
          address: formData.locationAddress,
          coordinates: {
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude)
          }
        },
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxParticipants: parseInt(formData.maxParticipants),
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(r => r),
        providedEquipment: formData.providedEquipment.split(',').map(e => e.trim()).filter(e => e)
      };

      await axios.post('/api/events', eventData);
      onSuccess();
      alert('Event created successfully!');
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Santa Monica Beach"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="34.0194"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="-118.4912"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  max="1000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements (comma-separated)
                </label>
                <input
                  type="text"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Bring water, Wear comfortable shoes"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provided Equipment (comma-separated)
                </label>
                <input
                  type="text"
                  name="providedEquipment"
                  value={formData.providedEquipment}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Gloves, Trash bags, Pickup tools"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;