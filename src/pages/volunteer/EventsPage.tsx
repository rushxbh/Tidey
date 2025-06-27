import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Filter, Search, MapIcon, ListIcon, Play, CheckCircle, XCircle } from 'lucide-react'
import { format, isAfter, isBefore, addHours } from 'date-fns'

const beaches = [
  { id: '1', name: 'Juhu Beach' },
  { id: '2', name: 'Versova Beach' },
  { id: '3', name: 'Dadar Chowpatty' },
  { id: '4', name: 'Girgaon Chowpatty' },
  { id: '5', name: 'Mahim Beach' }
]

interface Event {
  id: string
  title: string
  description?: string
  date: string
  beach_id: string
  max_volunteers: number
  status: 'upcoming' | 'live' | 'ended'
  registered_volunteers?: number
  beach?: { id: string; name: string }
}

function VolunteerEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let result = [...events]
    
    // Apply location filter
    if (activeFilter !== 'all') {
      result = result.filter(event => event.beach?.name === activeFilter)
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(event => event.status === statusFilter)
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        event => 
          event.title.toLowerCase().includes(query) || 
          event.beach?.name.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query)
      )
    }
    
    setFilteredEvents(result)
  }, [events, activeFilter, statusFilter, searchQuery])

  const getEventStatus = (eventDate: string): 'upcoming' | 'live' | 'ended' => {
    const now = new Date()
    const eventStart = new Date(eventDate)
    const eventEnd = addHours(eventStart, 4) // Assume 4-hour events
    
    if (isBefore(now, eventStart)) {
      return 'upcoming'
    } else if (isAfter(now, eventStart) && isBefore(now, eventEnd)) {
      return 'live'
    } else {
      return 'ended'
    }
  }

  const loadData = () => {
    try {
      const eventsData = JSON.parse(localStorage.getItem('tidewy_events') || '[]')
      
      // Add beach names and calculate status
      const eventsWithDetails = eventsData.map((event: Event) => ({
        ...event,
        beach: beaches.find(b => b.id === event.beach_id),
        status: getEventStatus(event.date)
      }))
      
      setEvents(eventsWithDetails)
      setLoading(false)
    } catch (error) {
      console.error('Error loading events:', error)
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4" />
      case 'live':
        return <Play className="h-4 w-4" />
      case 'ended':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'live':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'ended':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
          <p className="mt-2 text-gray-600">Join beach cleanup drives and make a difference</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-xl transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <ListIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-3 rounded-xl transition-all duration-200 ${
              viewMode === 'map'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          {/* Location Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Location:</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeFilter === 'all'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Beaches
              </button>
              {beaches.map((beach) => (
                <button
                  key={beach.id}
                  onClick={() => setActiveFilter(beach.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeFilter === beach.name
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {beach.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  statusFilter === 'all'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  statusFilter === 'upcoming'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter('live')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  statusFilter === 'live'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                Live
              </button>
              <button
                onClick={() => setStatusFilter('ended')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  statusFilter === 'ended'
                    ? 'bg-gray-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Ended
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Events Display */}
      {viewMode === 'list' ? (
        <div className="grid gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                            {event.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-gray-500">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-sm">{event.beach?.name}</span>
                            </div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                              {getStatusIcon(event.status)}
                              <span className="ml-1 capitalize">{event.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {event.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{format(new Date(event.date), 'PPP')} at {format(new Date(event.date), 'p')}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{event.registered_volunteers || 0}/{event.max_volunteers} volunteers</span>
                          </div>
                        </div>
                        
                        <Link
                          to={`/volunteer/events/${event.id}`}
                          className="inline-flex items-center px-6 py-3 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || activeFilter !== 'all' || statusFilter !== 'all'
                  ? 'No events match your current filters.'
                  : 'No events are available at the moment.'
                }
              </p>
              {(searchQuery || activeFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setActiveFilter('all')
                    setStatusFilter('all')
                    setSearchQuery('')
                  }}
                  className="inline-flex items-center px-6 py-3 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-all duration-200"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Interactive Map View</h3>
              <p className="text-gray-500">
                Map integration would be implemented here with event markers and real-time locations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VolunteerEventsPage