import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Filter, Search, MapIcon, ListIcon } from 'lucide-react'
import { format } from 'date-fns'

const beaches = [
  { id: '1', name: 'Juhu Beach' },
  { id: '2', name: 'Versova Beach' },
  { id: '3', name: 'Dadar Chowpatty' },
  { id: '4', name: 'Girgaon Chowpatty' },
  { id: '5', name: 'Mahim Beach' }
]

function VolunteerEventsPage() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
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
  }, [events, activeFilter, searchQuery])

  const loadData = () => {
    try {
      const eventsData = JSON.parse(localStorage.getItem('tidewy_events') || '[]')
      
      // Filter for upcoming events only and add beach names
      const upcomingEvents = eventsData
        .filter(event => new Date(event.date) > new Date() && event.status === 'upcoming')
        .map(event => ({
          ...event,
          beach: beaches.find(b => b.id === event.beach_id)
        }))
      
      setEvents(upcomingEvents)
      setLoading(false)
    } catch (error) {
      console.error('Error loading events:', error)
      setLoading(false)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Find Events</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ListIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-md ${
              viewMode === 'map'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Beaches
              </button>
              {beaches.map((beach) => (
                <button
                  key={beach.id}
                  onClick={() => setActiveFilter(beach.name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                    activeFilter === beach.name
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {beach.name}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Events display - List or Map view */}
      {viewMode === 'list' ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <li key={event.id}>
                  <div className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 text-primary-600 rounded-md flex items-center justify-center">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          <div className="flex items-center mt-1">
                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p className="text-sm text-gray-500">{event.beach?.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm text-gray-500">
                          {format(new Date(event.date), 'PPP')} at {format(new Date(event.date), 'p')}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Beach Please NGO
                        </p>
                      </div>
                    </div>
                    {event.description && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span>{event.registered_volunteers || 0}/{event.max_volunteers} volunteers</span>
                      </div>
                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                        View Details
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || activeFilter !== 'all' 
                    ? 'No events match your current filters.'
                    : 'No upcoming events are available at the moment.'
                  }
                </p>
                {(searchQuery || activeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setActiveFilter('all')
                      setSearchQuery('')
                    }}
                    className="mt-2 text-primary-600 hover:text-primary-500"
                  >
                    Clear filters
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="h-[500px] flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Map View</h3>
              <p className="mt-1 text-sm text-gray-500">
                Map integration would be implemented here with event markers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VolunteerEventsPage