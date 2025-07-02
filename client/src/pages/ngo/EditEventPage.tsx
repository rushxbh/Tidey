import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Save, ArrowLeft } from 'lucide-react';
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
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  requirements: string[];
  providedEquipment: string[];
  wasteCollected?: number;
  beachHealthScoreBefore?: number;
  beachHealthScoreAfter?: number;
}

const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
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
    providedEquipment: '',
    wasteCollected: '',
    beachHealthScoreBefore: '',
    beachHealthScoreAfter: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${id}`);
      const eventData = response.data.event;
      
      setEvent(eventData);
      setFormData({
        title: eventData.title,
        description: eventData.description,
        locationName: eventData.location.name,
        locationAddress: eventData.location.address,
        latitude: eventData.location.coordinates.latitude.toString(),
        longitude: eventData.location.coordinates.longitude.toString(),
        date: new Date(eventData.date).toISOString().split('T')[0],
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        maxParticipants: eventData.maxParticipants.toString(),
        requirements: eventData.requirements.join(', '),
        providedEquipment: eventData.providedEquipment.join(', '),
        wasteCollected: eventData.wasteCollected?.toString() || '',
        beachHealthScoreBefore: eventData.beachHealthScoreBefore?.toString() || '',
        beachHealthScoreAfter: eventData.beachHealthScoreAfter?.toString() || ''
      });
    } catch (err: any) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        maxParticipants: parseInt(formData.maxParticipants),
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(r => r),
        providedEquipment: formData.providedEquipment.split(',').map(e => e.trim()).filter(e => e)
      };

      // Add optional fields if they have values
      if (formData.wasteCollected) {
        updateData.wasteCollected = parseFloat(formData.wasteCollected);
      }
      if (formData.beachHealthScoreBefore) {
        updateData.beachHealthScoreBefore = parseFloat(formData.beachHealthScoreBefore);
      }
      if (formData.beachHealthScoreAfter) {
        updateData.beachHealthScoreAfter = parseFloat(formData.beachHealthScoreAfter);
      }

      await axios.put(`/api/events/${id}`, updateData);
      
      setSuccess('Event updated successfully!');
      setTimeout(() => {
        navigate('/ngo/events');
      }, 2000);
    } catch (err: any) {
      console.error('Error updating event:', err);
      setError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.put(`/api/events/${id}`, { status: newStatus });
      setEvent(prev => prev ? { ...prev, status: newStatus as any } : null);
      setSuccess(`Event status changed to ${newStatus}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
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
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
        <button
          onClick={() => navigate('/ngo/events')}
          className="btn-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/ngo/events')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
            <p className="text-gray-600">Update event details and manage status</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(event.status)}`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Event Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    rows={4}
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
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Location cannot be changed after creation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="locationAddress"
                    value={formData.locationAddress}
                    onChange={handleInputChange}
                    className="input-field"
                    disabled
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
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Date cannot be changed after creation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    className="input-field"
                    min={event.currentParticipants}
                    max="1000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {event.currentParticipants} participants
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="input-field"
                    disabled
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
                    disabled
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

                {/* Impact Metrics (for completed events) */}
                {(event.status === 'completed' || event.status === 'ongoing') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Waste Collected (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="wasteCollected"
                        value={formData.wasteCollected}
                        onChange={handleInputChange}
                        className="input-field"
                        min="0"
                        placeholder="0.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beach Health Score Before (0-100)
                      </label>
                      <input
                        type="number"
                        name="beachHealthScoreBefore"
                        value={formData.beachHealthScoreBefore}
                        onChange={handleInputChange}
                        className="input-field"
                        min="0"
                        max="100"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beach Health Score After (0-100)
                      </label>
                      <input
                        type="number"
                        name="beachHealthScoreAfter"
                        value={formData.beachHealthScoreAfter}
                        onChange={handleInputChange}
                        className="input-field"
                        min="0"
                        max="100"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/ngo/events')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Status Management Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Event Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2">
                {event.status === 'upcoming' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('ongoing')}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                    >
                      Start Event
                    </button>
                    <button
                      onClick={() => handleStatusChange('cancelled')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                    >
                      Cancel Event
                    </button>
                  </>
                )}

                {event.status === 'ongoing' && (
                  <button
                    onClick={() => handleStatusChange('completed')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                  >
                    Complete Event
                  </button>
                )}

                {(event.status === 'completed' || event.status === 'cancelled') && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    Event {event.status}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Event Statistics</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Participants</span>
                <span className="font-semibold text-gray-900">
                  {event.currentParticipants}/{event.maxParticipants}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                ></div>
              </div>

              {event.wasteCollected && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Waste Collected</span>
                  <span className="font-semibold text-green-600">{event.wasteCollected}kg</span>
                </div>
              )}

              {event.beachHealthScoreAfter && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Beach Health Score</span>
                  <span className="font-semibold text-blue-600">{event.beachHealthScoreAfter}/100</span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/ngo/events/${event._id}/participants`)}
                className="w-full btn-secondary text-sm"
              >
                <Users className="h-4 w-4 mr-2" />
                View Participants
              </button>
              
              {event.status === 'ongoing' && (
                <button
                  onClick={() => navigate(`/ngo/events/${event._id}/qr`)}
                  className="w-full btn-secondary text-sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Generate QR Code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;