import React, { useState, useEffect } from 'react';
import { Users, Mail, MapPin, Calendar, Trophy, Search, Filter, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Volunteer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  profilePicture?: string;
  aquaCoins: number;
  totalHoursVolunteered: number;
  eventsJoined: number;
  achievements: string[];
  createdAt: string;
}

interface Event {
  _id: string;
  title: string;
  date: string;
  participants: string[];
}

const VolunteersPage: React.FC = () => {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedEvent, setSelectedEvent] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all events created by this NGO
      const eventsResponse = await axios.get('/api/events');
      const ngoEvents = eventsResponse.data.events?.filter((event: Event) => 
        event.participants && event.participants.length > 0
      ) || [];
      setEvents(ngoEvents);

      // Get unique volunteer IDs from all events
      const volunteerIds = new Set<string>();
      ngoEvents.forEach((event: Event) => {
        event.participants.forEach((participantId: string) => {
          volunteerIds.add(participantId);
        });
      });

      // Fetch volunteer details
      if (volunteerIds.size > 0) {
        // Note: This would ideally be a batch request, but we'll simulate it
        const volunteerPromises = Array.from(volunteerIds).map(async (id) => {
          try {
            const response = await axios.get(`/api/users/${id}`);
            return response.data;
          } catch (err) {
            console.error(`Error fetching volunteer ${id}:`, err);
            return null;
          }
        });

        const volunteerResults = await Promise.all(volunteerPromises);
        const validVolunteers = volunteerResults.filter(v => v !== null);
        setVolunteers(validVolunteers);
      }

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load volunteer data');
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedEvent === 'all') {
      return matchesSearch;
    }
    
    // Check if volunteer participated in selected event
    const event = events.find(e => e._id === selectedEvent);
    const participatedInEvent = event?.participants.includes(volunteer._id);
    
    return matchesSearch && participatedInEvent;
  });

  const sortedVolunteers = [...filteredVolunteers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'events':
        return b.eventsJoined - a.eventsJoined;
      case 'hours':
        return b.totalHoursVolunteered - a.totalHoursVolunteered;
      case 'coins':
        return b.aquaCoins - a.aquaCoins;
      case 'joined':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const exportVolunteers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Location', 'Events Joined', 'Hours Volunteered', 'AquaCoins', 'Join Date'],
      ...sortedVolunteers.map(volunteer => [
        volunteer.name,
        volunteer.email,
        volunteer.phone || '',
        volunteer.location || '',
        volunteer.eventsJoined.toString(),
        volunteer.totalHoursVolunteered.toString(),
        volunteer.aquaCoins.toString(),
        new Date(volunteer.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'volunteers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading volunteers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
        <button 
          onClick={exportVolunteers}
          className="btn-primary"
          disabled={volunteers.length === 0}
        >
          <Download className="h-5 w-5 mr-2" />
          Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
              <p className="text-2xl font-bold text-gray-900">{volunteers.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {volunteers.reduce((sum, v) => sum + v.totalHoursVolunteered, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Events/Volunteer</p>
              <p className="text-2xl font-bold text-gray-900">
                {volunteers.length > 0 ? Math.round(volunteers.reduce((sum, v) => sum + v.eventsJoined, 0) / volunteers.length) : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-ocean-100 rounded-lg">
              <Users className="h-6 w-6 text-ocean-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {volunteers.filter(v => {
                  const lastMonth = new Date();
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  return new Date(v.createdAt) > lastMonth;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="input-field"
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>
                  {event.title} ({new Date(event.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="name">Sort by Name</option>
              <option value="events">Sort by Events</option>
              <option value="hours">Sort by Hours</option>
              <option value="coins">Sort by AquaCoins</option>
              <option value="joined">Sort by Join Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Volunteers List */}
      {sortedVolunteers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedEvent !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Volunteers will appear here once they register for your events.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedVolunteers.map((volunteer) => (
            <div key={volunteer._id} className="card">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                  {volunteer.profilePicture ? (
                    <img
                      src={volunteer.profilePicture}
                      alt={volunteer.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{volunteer.name}</h3>
                  <p className="text-sm text-gray-600">Volunteer</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{volunteer.email}</span>
                </div>
                {volunteer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="h-4 w-4 mr-2">📞</span>
                    <span>{volunteer.phone}</span>
                  </div>
                )}
                {volunteer.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{volunteer.location}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Joined {new Date(volunteer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{volunteer.eventsJoined}</p>
                  <p className="text-xs text-gray-600">Events</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{volunteer.totalHoursVolunteered}</p>
                  <p className="text-xs text-gray-600">Hours</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-sm text-gray-600">{volunteer.achievements.length} achievements</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-ocean-600">{volunteer.aquaCoins} coins</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.location.href = `mailto:${volunteer.email}`}
                  className="w-full btn-secondary text-sm"
                >
                  Contact Volunteer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination could be added here if needed */}
    </div>
  );
};

export default VolunteersPage;