import React, { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Filter } from 'lucide-react';

const EventsPage: React.FC = () => {
  const [filter, setFilter] = useState('all');

  const events = [
    {
      id: 1,
      title: 'Santa Monica Beach Cleanup',
      date: '2024-01-15',
      time: '9:00 AM - 12:00 PM',
      location: 'Santa Monica Beach, CA',
      participants: 25,
      maxParticipants: 50,
      status: 'upcoming',
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      title: 'Venice Beach Conservation',
      date: '2024-01-18',
      time: '8:00 AM - 11:00 AM',
      location: 'Venice Beach, CA',
      participants: 18,
      maxParticipants: 30,
      status: 'upcoming',
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      title: 'Malibu Coastal Cleanup',
      date: '2024-01-12',
      time: '10:00 AM - 2:00 PM',
      location: 'Malibu Beach, CA',
      participants: 40,
      maxParticipants: 40,
      status: 'completed',
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Beach Cleanup Events</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="card overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.status === 'upcoming' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()} • {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.participants}/{event.maxParticipants} participants
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                ></div>
              </div>

              {event.status === 'upcoming' ? (
                <button className="w-full btn-primary">
                  Join Event
                </button>
              ) : (
                <button className="w-full btn-secondary" disabled>
                  Event Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;