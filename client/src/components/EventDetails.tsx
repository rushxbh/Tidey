import React, { useEffect, useState } from "react";
import axios from "axios";

interface EventDetailsProps {
  eventId: string;
  onClose: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventId, onClose }) => {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${eventId}`);
        setEvent(res.data.event);
      } catch (err) {
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-lg">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <p>Event not found.</p>
          <button onClick={onClose} className="btn-primary mt-4">Close</button>
        </div>
      </div>
    );
  }

  // Google Maps Embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(
    event.location?.address || event.location?.name || ""
  )}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
          aria-label="Close"
        >
          ×
        </button>
        {/* Map */}
        <div className="w-full h-64 bg-gray-200">
          <iframe
            title="Event Location"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0, borderRadius: "0.75rem 0.75rem 0 0" }}
            src={mapUrl}
            allowFullScreen
          />
        </div>
        {/* Details */}
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-2 text-primary-700">{event.title}</h2>
          <div className="flex items-center text-gray-600 mb-4">
            <span className="mr-4">
              <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
            </span>
            <span>
              <strong>Time:</strong> {event.startTime} - {event.endTime}
            </span>
          </div>
          <div className="mb-4">
            <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold mr-2">
              {event.location?.name}
            </span>
            <span className="text-gray-500 text-sm">{event.location?.address}</span>
          </div>
          <p className="mb-6 text-gray-800">{event.description}</p>
          <div className="flex items-center mb-6">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium mr-2">
              {event.currentParticipants}/{event.maxParticipants} participants
            </span>
            {event.transaction_hash && (
              <a
                href={`https://sepolia.etherscan.io/tx/${event.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-200 text-gray-900 font-semibold text-sm shadow hover:from-cyan-500 hover:to-blue-300 transition"
              >
                {/* Ethereum SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="mr-1"
                >
                  <g>
                    <polygon fill="#343434" points="16,2 16,22 29,16.5"/>
                    <polygon fill="#8C8C8C" points="16,2 3,16.5 16,22"/>
                    <polygon fill="#3C3C3B" points="16,25 16,30 29,18"/>
                    <polygon fill="#8C8C8C" points="16,30 16,25 3,18"/>
                    <polygon fill="#141414" points="16,22 29,16.5 16,25"/>
                    <polygon fill="#393939" points="16,25 3,16.5 16,22"/>
                  </g>
                </svg>
                View Transaction
              </a>
            )}
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-2">
            <h3 className="text-lg font-semibold text-blue-700 mb-1">Want to join this event?</h3>
            <p className="text-blue-800">
              Go to the event location and scan the QR code to register your attendance and earn rewards on the blockchain!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;