import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Filter, QrCode, Camera, CheckCircle, ExternalLink, Upload } from 'lucide-react';
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
  };
  currentParticipants: number;
  maxParticipants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizer: {
    name: string;
    organizationName?: string;
  };
  images: string[];
  participants: string[];
  transaction_hash:string;
}

interface Attendance {
  event: string;
  status: 'registered' | 'checked-in' | 'checked-out';
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked?: number;
}

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendances, setAttendances] = useState<{ [key: string]: Attendance }>({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedEventForUpload, setSelectedEventForUpload] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchUserAttendances();
  }, [filter, page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 9,
        sort: 'date:desc' // Latest events first
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await axios.get('/api/events', { params });
      setEvents(response.data.events || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAttendances = async () => {
    try {
      const response = await axios.get('/api/users/attendances');
      const attendanceMap: { [key: string]: Attendance } = {};
      response.data.attendances?.forEach((attendance: Attendance) => {
        attendanceMap[attendance.event] = attendance;
      });
      setAttendances(attendanceMap);
    } catch (err: any) {
      console.error('Error fetching attendances:', err);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      await axios.post(`/api/events/${eventId}/register`);
      fetchEvents();
      fetchUserAttendances();
      showSuccessNotification('Successfully registered for event!');
    } catch (err: any) {
      console.error('Error joining event:', err);
      showErrorNotification(err.response?.data?.message || 'Failed to join event');
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) {
      return;
    }

    try {
      await axios.delete(`/api/events/${eventId}/register`);
      fetchEvents();
      fetchUserAttendances();
      showSuccessNotification('Successfully unregistered from event!');
    } catch (err: any) {
      console.error('Error unregistering:', err);
      showErrorNotification(err.response?.data?.message || 'Failed to unregister');
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      const response = await axios.post('/api/qr/scan', { qrData });
      showSuccessNotification(response.data.message);
      fetchUserAttendances();
      setShowQRScanner(false);
    } catch (err: any) {
      console.error('Error scanning QR:', err);
      showErrorNotification(err.response?.data?.message || 'Failed to scan QR code');
    }
  };

  const handleCheckOut = async (eventId: string) => {
    try {
      const response = await axios.post(`/api/qr/checkout/${eventId}`);
      showSuccessNotification(`${response.data.message}. Hours worked: ${response.data.hoursWorked || 0}`);
      fetchUserAttendances();
    } catch (err: any) {
      console.error('Error checking out:', err);
      showErrorNotification(err.response?.data?.message || 'Failed to check out');
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

  const getGoogleMapsUrl = (locationName: string, address: string) => {
    const query = `${locationName}, ${address}`;
    return `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
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

  const getEventButtonContent = (event: Event) => {
    const attendance = attendances[event._id];
    const isRegistered = !!attendance;
    const isEventFull = event.currentParticipants >= event.maxParticipants;

    if (event.status === 'upcoming') {
      if (isRegistered) {
        return (
          <div className="space-y-2">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Registered
            </button>
            <button
              onClick={() => handleUnregister(event._id)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm"
            >
              Unregister
            </button>
          </div>
        );
      } else {
        return (
          <button
            onClick={() => handleJoinEvent(event._id)}
            className="w-full btn-primary"
            disabled={isEventFull}
          >
            {isEventFull ? 'Event Full' : 'Join Event'}
          </button>
        );
      }
    }

    if (event.status === 'ongoing' && isRegistered) {
      if (attendance.status === 'registered') {
        return (
          <button
            onClick={() => setShowQRScanner(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR to Check In
          </button>
        );
      } else if (attendance.status === 'checked-in') {
        return (
          <button
            onClick={() => handleCheckOut(event._id)}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium"
          >
            Check Out
          </button>
        );
      } else {
        return (
          <div className="w-full text-center py-2 text-sm text-green-600 font-medium">
            ✓ Attended ({attendance.hoursWorked || 0}h)
          </div>
        );
      }
    }

    if (event.status === 'completed' && isRegistered && attendance.status === 'checked-out') {
      return (
        <div className="space-y-2">
          <div className="w-full text-center py-2 text-sm text-green-600 font-medium">
            ✓ Completed ({attendance.hoursWorked || 0}h)
          </div>
          <button
            onClick={() => setSelectedEventForUpload(event._id)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center"
          >
            <Camera className="h-4 w-4 mr-2" />
            Upload Images
          </button>
        </div>
      );
    }

    return (
      <button className="w-full btn-secondary" disabled>
        {getStatusText(event.status)}
      </button>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">
          Beach Cleanup Events
        </h1>
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
              aria-label="Filter events by status"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for new events.
          </p>
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
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {getStatusText(event.status)}
                    </span>
                    {attendances[event._id] && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Registered
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()} •{" "}
                      {event.startTime} - {event.endTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <a
                        href={getGoogleMapsUrl(
                          event.location.name,
                          event.location.address
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        {event.location.name}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {event.currentParticipants}/{event.maxParticipants}{" "}
                      participants
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (event.currentParticipants / event.maxParticipants) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>

                  {getEventButtonContent(event)}

                  {event.transaction_hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${event.transaction_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block relative group"
                      style={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 0 1px 1px #00e1ff, 0 0 10px 1px #fff", // Less intense
                        background:
                          "linear-gradient(90deg, #e0f7fa 0%, #fff 100%)", // Softer color
                        position: "relative",
                        zIndex: 1,
                        border: "2px solid #00e1ff",
                      }}
                    >
                      <span
                        className="flex items-center justify-center px-4 py-2 text-center font-bold text-lg text-gray-900 tracking-wide relative z-10"
                        style={{
                          textShadow: "0 0 1px #fff, 0 0 2px #00e1ff",
                          letterSpacing: "1px",
                        }}
                      >
                        {/* Ethereum SVG logo */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 32 32"
                          fill="none"
                          className="mr-2"
                        >
                          <g>
                            <polygon
                              fill="#343434"
                              points="16,2 16,22 29,16.5"
                            />
                            <polygon
                              fill="#8C8C8C"
                              points="16,2 3,16.5 16,22"
                            />
                            <polygon
                              fill="#3C3C3B"
                              points="16,25 16,30 29,18"
                            />
                            <polygon fill="#8C8C8C" points="16,30 16,25 3,18" />
                            <polygon
                              fill="#141414"
                              points="16,22 29,16.5 16,25"
                            />
                            <polygon
                              fill="#393939"
                              points="16,25 3,16.5 16,22"
                            />
                          </g>
                        </svg>
                        Track on Blockchain
                      </span>
                      {/* Subtle reflection */}
                      <span
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(120deg, rgba(255,255,255,0.3) 0%, rgba(0,225,255,0.08) 60%, rgba(255,255,255,0.3) 100%)",
                          opacity: 0.4, // Less shiny
                          mixBlendMode: "screen",
                          animation: "shine 2.5s linear infinite",
                        }}
                      />
                      <style>
                        {`
                          @keyframes shine {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100%); }
                          }
                          .group:hover span[style*="pointer-events:none"] {
                            opacity: 0.7;
                          }
                        `}
                      </style>
                    </a>
                  )}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === pageNum
                          ? "bg-primary-600 text-white"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
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

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {/* Image Upload Modal */}
      {selectedEventForUpload && (
        <ImageUploadModal
          eventId={selectedEventForUpload}
          onClose={() => setSelectedEventForUpload(null)}
          onSuccess={() => {
            setSelectedEventForUpload(null);
            showSuccessNotification(
              "Images uploaded successfully! You earned 25 AquaCoins!"
            );
          }}
        />
      )}
    </div>
  );
};

// QR Scanner Modal Component
const QRScannerModal: React.FC<{ onScan: (data: string) => void; onClose: () => void }> = ({ onScan, onClose }) => {
  const [qrInput, setQrInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrInput.trim()) {
      onScan(qrInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Scan QR Code</h2>
        <p className="text-gray-600 mb-4">
          Scan the QR code displayed by the event organizer to check in.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or enter QR data manually:
            </label>
            <textarea
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Paste QR code data here..."
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!qrInput.trim()}
              className="btn-primary disabled:opacity-50"
            >
              Check In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Image Upload Modal Component
const ImageUploadModal: React.FC<{ 
  eventId: string; 
  onClose: () => void; 
  onSuccess: () => void; 
}> = ({ eventId, onClose, onSuccess }) => {
  const [images, setImages] = useState<File[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [beforeAfter, setBeforeAfter] = useState<('before' | 'after')[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageAdd = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files);
      setImages(prev => [...prev, ...newImages]);
      setDescriptions(prev => [...prev, ...newImages.map(() => '')]);
      setBeforeAfter(prev => [...prev, ...newImages.map(() => 'after' as const)]);
    }
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setLoading(true);
    try {
      // Upload each image
      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append('image', images[i]);
        formData.append('description', descriptions[i]);
        formData.append('beforeAfter', beforeAfter[i]);

        await axios.post(`/api/event-images/upload/${eventId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Submit for approval and coin reward
      await axios.post(`/api/event-images/submit/${eventId}`);
      
      onSuccess();
    } catch (err: any) {
      console.error('Error uploading images:', err);
      alert(err.response?.data?.message || 'Failed to upload images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Event Images</h2>
        <p className="text-gray-600 mb-4">
          Upload before/after images of the beach cleanup. You'll earn 25 AquaCoins for submitting images!
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageAdd(e.target.files)}
              className="input-field"
              title="Select images to upload"
              placeholder="Select images"
            />
          </div>

          {images.map((image, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center space-x-4 mb-2">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={descriptions[index]}
                    onChange={(e) => {
                      const newDescriptions = [...descriptions];
                      newDescriptions[index] = e.target.value;
                      setDescriptions(newDescriptions);
                    }}
                    className="input-field mb-2"
                  />
                  <label htmlFor={`beforeAfter-select-${index}`} className="sr-only">
                    Select before or after cleanup
                  </label>
                  <select
                    id={`beforeAfter-select-${index}`}
                    value={beforeAfter[index]}
                    onChange={(e) => {
                      const newBeforeAfter = [...beforeAfter];
                      newBeforeAfter[index] = e.target.value as 'before' | 'after';
                      setBeforeAfter(newBeforeAfter);
                    }}
                    className="input-field"
                  >
                    <option value="before">Before Cleanup</option>
                    <option value="after">After Cleanup</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary disabled:opacity-50"
            disabled={loading || images.length === 0}
          >
            {loading ? 'Uploading...' : `Submit Images (+25 🪙)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;