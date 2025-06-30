import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Filter, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  currentParticipants: number;
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer: {
    name: string;
    organizationName?: string;
  };
  participants: string[];
  requirements: string[];
  providedEquipment: string[];
  wasteCollected?: number;
  images: string[];
}

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [filter, page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 12
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await axios.get('/api/events', { params });
      
      // Filter events to show only those created by this NGO
      const ngoEvents = response.data.events?.filter((event: Event) => 
        event.organizer.name === user?.name || event.organizer.organizationName === user?.organizationName
      ) || [];
      
      setEvents(ngoEvents);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
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
      fetchEvents(); // Refresh events
      alert('Event deleted successfully');
    } catch (err: any) {
      console.error('Error deleting event:', err);
      alert(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleUpdateEventStatus = async (eventId: string, newStatus: string) => {
    try {
      await axios.put(`/api/events/${eventId}`, { status: newStatus });
      fetchEvents(); // Refresh events
      alert('Event status updated successfully');
    } catch (err: any) {
      console.error('Error updating event status:', err);
      alert(err.response?.data?.message || 'Failed to update event status');
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

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="input-field"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {events.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">Create your first beach cleanup event to get started.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="card overflow-hidden">
                {event.images && event.images.length > 0 ? (
                  <img
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-ocean-100 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-primary-600" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.location.href = `/ngo/events/${event._id}/edit`}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit Event"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()} • {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location.name}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {event.currentParticipants}/{event.maxParticipants} participants
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                    ></div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center space-x-2">
                    {event.status === 'upcoming' && (
                      <>
                        <button
                          onClick={() => handleUpdateEventStatus(event._id, 'ongoing')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                          Start Event
                        </button>
                        <button
                          onClick={() => handleUpdateEventStatus(event._id, 'cancelled')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {event.status === 'ongoing' && (
                      <button
                        onClick={() => handleUpdateEventStatus(event._id, 'completed')}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                      >
                        Complete Event
                      </button>
                    )}
                    {(event.status === 'completed' || event.status === 'cancelled') && (
                      <div className="w-full text-center py-2 text-sm text-gray-500">
                        Event {event.status}
                        {event.wasteCollected && (
                          <span className="block text-green-600 font-medium">
                            {event.wasteCollected}kg waste collected
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

// Create Event Modal Component (same as in Dashboard)
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

// Event Details Modal Component
const EventDetailsModal: React.FC<{ event: Event; onClose: () => void }> = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{event.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Date & Time</h3>
                <p className="text-gray-600">
                  {new Date(event.date).toLocaleDateString()}
                  <br />
                  {event.startTime} - {event.endTime}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600">
                  {event.location.name}
                  <br />
                  {event.location.address}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Participants</h3>
                <p className="text-gray-600">
                  {event.currentParticipants} / {event.maxParticipants} registered
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
                  {getStatusText(event.status)}
                </span>
              </div>
            </div>

            {event.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {event.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {event.providedEquipment.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Provided Equipment</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {event.providedEquipment.map((equipment, index) => (
                    <li key={index}>{equipment}</li>
                  ))}
                </ul>
              </div>
            )}

            {event.wasteCollected && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Impact</h3>
                <p className="text-green-600 font-medium">
                  {event.wasteCollected}kg of waste collected
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-4">
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function (moved outside component to avoid re-declaration)
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

const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default EventsPage;