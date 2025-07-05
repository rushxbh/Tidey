import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  QrCode,
  ExternalLink,
  Camera,
  BarChart3,
} from "lucide-react";
import { useWriteContract } from "wagmi";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { TideyABI } from "../../generated/factories/contracts/Tidey__factory";
import { TIDEY_ADDRESS } from "../../contracts/config";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { text } from "stream/consumers";

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
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  currentParticipants: number;
  maxParticipants: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
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

interface EventImage {
  _id: string;
  imageUrl: string;
  description?: string;
  volunteer: {
    name: string;
    profilePicture?: string;
  };
  beforeAfter: "before" | "after";
  approved: boolean;
  createdAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-100 text-blue-800";
    case "ongoing":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [showEventImages, setShowEventImages] = useState<string | null>(null);
  const [eventImages, setEventImages] = useState<EventImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filter, page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 12,
        sort: "date:desc", // Latest events first
      };

      if (filter !== "all") {
        params.status = filter;
      }

      const response = await axios.get("/api/events", { params });

      // Filter events to show only those created by this NGO
      const ngoEvents =
        response.data.events?.filter(
          (event: Event) =>
            event.organizer.name === user?.name ||
            event.organizer.organizationName === user?.organizationName
        ) || [];

      setEvents(ngoEvents);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await axios.delete(`/api/events/${eventId}`);
      fetchEvents(); // Refresh events
      showSuccessNotification("Event deleted successfully");
    } catch (err: any) {
      console.error("Error deleting event:", err);
      showErrorNotification(
        err.response?.data?.message || "Failed to delete event"
      );
    }
  };

  const handleUpdateEventStatus = async (
    eventId: string,
    newStatus: string
  ) => {
    try {
      await axios.put(`/api/events/${eventId}`, { status: newStatus });
      fetchEvents(); // Refresh events
      showSuccessNotification("Event status updated successfully");
    } catch (err: any) {
      console.error("Error updating event status:", err);
      showErrorNotification(
        err.response?.data?.message || "Failed to update event status"
      );
    }
  };

  const generateQRCode = async (eventId: string) => {
    try {
      const response = await axios.get(`/api/qr/generate/${eventId}`);
      setShowQRCode(response.data.qrCode);
    } catch (err: any) {
      console.error("Error generating QR code:", err);
      showErrorNotification("Failed to generate QR code");
    }
  };

  const fetchEventImages = async (eventId: string) => {
    try {
      setLoadingImages(true);
      const response = await axios.get(`/api/event-images/event/${eventId}`);
      setEventImages(response.data.images || []);
      setShowEventImages(eventId);
    } catch (err: any) {
      console.error("Error fetching event images:", err);
      showErrorNotification("Failed to load event images");
    } finally {
      setLoadingImages(false);
    }
  };

  const handleUploadToBeachScanner = (eventId: string) => {
    window.location.href = `/ngo/beach-scanner?eventId=${eventId}`;
  };

  const showSuccessNotification = (message: string) => {
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2";
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
    const notification = document.createElement("div");
    notification.className =
      "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2";
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

  const getGoogleMapsUrl = (location: Event["location"]) => {
    if (location.coordinates) {
      return `https://www.google.com/maps?q=${location.coordinates.latitude},${location.coordinates.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      location.address || location.name
    )}`;
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

  // If showing event images
  if (showEventImages) {
    const event = events.find((e) => e._id === showEventImages);

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowEventImages(null)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Back"
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Event Images</h1>
            <p className="text-gray-600">{event?.title}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => handleUploadToBeachScanner(showEventImages)}
              className="btn-primary"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Analyze in Beach Scanner
            </button>
          </div>
        </div>

        {loadingImages ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading images...</p>
          </div>
        ) : eventImages.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No images found
            </h3>
            <p className="text-gray-600">
              Volunteers haven't uploaded any images for this event yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventImages.map((image) => (
              <div key={image._id} className="card overflow-hidden">
                <img
                  src={image.imageUrl}
                  alt={image.description || "Event image"}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        image.beforeAfter === "before"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {image.beforeAfter === "before"
                        ? "Before Cleanup"
                        : "After Cleanup"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {image.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {image.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2">
                    {image.volunteer.profilePicture ? (
                      <img
                        src={image.volunteer.profilePicture}
                        alt={image.volunteer.name}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-3 w-3 text-gray-500" />
                      </div>
                    )}
                    <span className="text-xs text-gray-600">
                      Uploaded by {image.volunteer.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary inline-flex items-center"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events found
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first beach cleanup event to get started.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center"
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
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        event.status
                      )}`}
                    >
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
                        onClick={() =>
                          (window.location.href = `/ngo/events/${event._id}/edit`)
                        }
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
                        href={getGoogleMapsUrl(event.location)}
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

                  {/* Status Actions */}
                  <div className="flex items-center space-x-2">
                    {event.status === "upcoming" && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateEventStatus(event._id, "ongoing")
                          }
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                          Start Event
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateEventStatus(event._id, "cancelled")
                          }
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {event.status === "ongoing" && (
                      <>
                        <button
                          onClick={() => generateQRCode(event._id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center"
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          QR Code
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateEventStatus(event._id, "completed")
                          }
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium"
                        >
                          Complete
                        </button>
                      </>
                    )}
                    {event.status === "completed" && (
                      <button
                        onClick={() => fetchEventImages(event._id)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center"
                      >
                        <Camera className="h-4 w-4 mr-1" />
                        View Images
                      </button>
                    )}
                    {event.status === "cancelled" && (
                      <div className="w-full text-center py-2 text-sm text-gray-500">
                        Event cancelled
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
                          ? "bg-primary-600 text-white"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
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
            showSuccessNotification("Event created successfully!");
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

      {/* QR Code Modal */}
      {showQRCode && (
        <QRCodeModal qrCode={showQRCode} onClose={() => setShowQRCode(null)} />
      )}
    </div>
  );
};

// QR Code Modal Component
const QRCodeModal: React.FC<{ qrCode: string; onClose: () => void }> = ({
  qrCode,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Event Check-in QR Code
        </h2>
        <p className="text-gray-600 mb-6">
          Show this QR code to volunteers for check-in
        </p>

        <div className="mb-6">
          <img src={qrCode} alt="QR Code" className="mx-auto" />
        </div>

        <button onClick={onClose} className="btn-primary w-full">
          Close
        </button>
      </div>
    </div>
  );
};

// Create Event Modal Component
const CreateEventModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    locationName: "",
    locationAddress: "",
    date: "",
    startTime: "",
    endTime: "",
    maxParticipants: "",
    requirements: "",
    providedEquipment: "",
  });
  const [loading, setLoading] = useState(false);
  const { address: walletAddress } = useAccount();
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [blockchainRegistered, setBlockchainRegistered] = useState(false);
  const [blockchainError, setBlockchainError] = useState("");
  const [blockchainInProgress, setBlockchainInProgress] = useState(false);
  const { writeContractAsync, isPending: isBlockchainPending } =
    useWriteContract();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBlockchainError("");
    setIsRegistered(false);
    setBlockchainRegistered(false);
    if (!walletAddress) {
      setError("No wallet connected. Please connect your wallet first.");
      return;
    }
    setLoading(true);
    setBlockchainInProgress(true);
    // Validate same-day events with future time
    const eventDate = new Date(formData.date);
    const today = new Date();
    const isToday = eventDate.toDateString() === today.toDateString();

    if (isToday) {
      const currentTime = today.getHours() * 60 + today.getMinutes();
      const [startHour, startMinute] = formData.startTime
        .split(":")
        .map(Number);
      const eventStartTime = startHour * 60 + startMinute;

      if (eventStartTime <= currentTime) {
        setError("Event start time must be in the future for same-day events");
        setLoading(false);
        return;
      }
    }
    try {
      const title = formData.title;
      const description = formData.description;
      const location = `${formData.locationName}, ${formData.locationAddress}`;

      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
      const startTime = BigInt(Math.floor(startDateTime.getTime() / 1000));
      const endTime = BigInt(Math.floor(endDateTime.getTime() / 1000));
      const maxParticipants = BigInt(formData.maxParticipants);
      const taskDuration = BigInt(
        Math.floor(
          (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60)
        )
      );
      console.log("Starting blockchain Event registration...");
      let tx;
      try {
        tx = await writeContractAsync({
          address: TIDEY_ADDRESS,
          abi: TideyABI,
          functionName: "createTask",
          args: [
            title,
            description,
            location,
            taskDuration,
            startTime,
            endTime,
            maxParticipants,
          ],
        });
      } catch (blockchainErr: any) {
        throw new Error(
          blockchainErr?.shortMessage ||
            blockchainErr?.message ||
            "Transaction rejected or failed"
        );
      }

      // Wait for transaction to be mined
      const provider = new ethers.BrowserProvider(window.ethereum);
      const receipt = await provider.waitForTransaction(tx, 1, 60000); // wait 1 confirmation, up to 60s
      if (!receipt || receipt.status !== 1) {
        throw new Error("Blockchain transaction failed or was reverted");
      }
      const txHash = tx;

      console.log("Blockchain registration successful");
      setBlockchainRegistered(true);

      // Step 2: Only after blockchain success, register Event in MongoDB
      // Calculate volunteeringHours as the floored difference in hours
      const NewstartDateTime = new Date(
        `${formData.date}T${formData.startTime}`
      );

      const NEwendDateTime = new Date(`${formData.date}T${formData.endTime}`);
      const formattedvolunteeringHours = Math.floor(
        (NEwendDateTime.getTime() - NewstartDateTime.getTime()) /
          (1000 * 60 * 60)
      );
      try {
        const eventData = {
          title: formData.title,
          description: formData.description,
          location: {
            name: formData.locationName,
            address: formData.locationAddress,
            coordinates: {
              latitude: 0, // Will be set by location search in future
              longitude: 0,
            },
          },
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          transaction_hash: txHash,
          volunteeringHours: formattedvolunteeringHours,
          maxParticipants: parseInt(formData.maxParticipants),
          requirements: formData.requirements
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r),
          providedEquipment: formData.providedEquipment
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e),
        };

        await axios.post("/api/events", eventData);
        onSuccess();
      } catch (err: any) {
        console.error("Error creating event:", err);
        setError(err.response?.data?.message || "Failed to create event");
      }
    } catch (blockchainErr: any) {
      console.error("Blockchain registration error:", blockchainErr);
      setBlockchainError(
        `Blockchain registration failed: ${
          blockchainErr.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
      setBlockchainInProgress(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Create Event
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              title="Close"
              aria-label="Close"
            >
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Juhu Beach"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input-field"
                  min={today}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Participants
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
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
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Event Details Modal Component
const EventDetailsModal: React.FC<{ event: Event; onClose: () => void }> = ({
  event,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
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
                <h3 className="font-semibold text-gray-900 mb-2">
                  Date & Time
                </h3>
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
                <h3 className="font-semibold text-gray-900 mb-2">
                  Participants
                </h3>
                <p className="text-gray-600">
                  {event.currentParticipants} / {event.maxParticipants}{" "}
                  registered
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    event.status
                  )}`}
                >
                  {getStatusText(event.status)}
                </span>
              </div>
            </div>

            {event.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Requirements
                </h3>
                <ul className="list-disc list-inside text-gray-600">
                  {event.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {event.providedEquipment.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Provided Equipment
                </h3>
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

// Event Images Modal Component
const EventImagesModal: React.FC<{
  eventId: string;
  images: EventImage[];
  onClose: () => void;
  onUploadToScanner: (eventId: string) => void;
}> = ({ eventId, images, onClose, onUploadToScanner }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Event Images</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>

          {images.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No images found
              </h3>
              <p className="text-gray-600">
                Volunteers haven't uploaded any images for this event yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image._id}
                  className="border rounded-lg overflow-hidden"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.description || "Event image"}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          image.beforeAfter === "before"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {image.beforeAfter === "before"
                          ? "Before Cleanup"
                          : "After Cleanup"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {image.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {image.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-2">
                      {image.volunteer.profilePicture ? (
                        <img
                          src={image.volunteer.profilePicture}
                          alt={image.volunteer.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="h-3 w-3 text-gray-500" />
                        </div>
                      )}
                      <span className="text-xs text-gray-600">
                        Uploaded by {image.volunteer.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
            <button
              onClick={() => onUploadToScanner(eventId)}
              className="btn-primary"
              disabled={images.length === 0}
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Analyze in Beach Scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
