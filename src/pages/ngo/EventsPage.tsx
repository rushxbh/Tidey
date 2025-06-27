import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, Calendar, MapPin, Users, Filter, Search } from 'lucide-react'
import { format } from 'date-fns'

interface Beach {
  id: string
  name: string
}

interface Event {
  id: string
  title: string
  date: string
  beach_id: string
  status: string
  description?: string
  registered_volunteers?: number
  max_volunteers: number
  beach?: Beach
}

const beaches: Beach[] = [
  { id: '1', name: 'Juhu Beach' },
  { id: '2', name: 'Versova Beach' },
  { id: '3', name: 'Dadar Chowpatty' },
  { id: '4', name: 'Girgaon Chowpatty' },
  { id: '5', name: 'Mahim Beach' }
]

function NgoEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    let result = [...events]
    
    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(event => event.status === activeFilter)
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        event => 
          event.title.toLowerCase().includes(query) || 
          event.description?.toLowerCase().includes(query)
      )
    }
    
    setFilteredEvents(result)
  }, [events, activeFilter, searchQuery])

  const loadEvents = () => {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('tidewy_events') || '[]')
      
      // Add beach names to events
      const eventsWithBeaches = storedEvents.map((event: Event) => ({
        ...event,
        beach: beaches.find(b => b.id === event.beach_id)
      }))
      
      setEvents(eventsWithBeaches)
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
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Link
          to="/ngo/events/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Filters and search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'all'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('upcoming')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'upcoming'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'completed'
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
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

      {/* Events list */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <li key={event.id}>
                <div className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-md ${event.status === 'upcoming' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'} flex items-center justify-center`}>
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
                      <div className="flex items-center mt-1">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          {event.registered_volunteers || 0} / {event.max_volunteers} volunteers
                        </p>
                      </div>
                    </div>
                  </div>
                  {event.description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 line-clamp-2">{event.description}</p>
                    </div>
                  )}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.status === 'upcoming'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </span>
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
                  : 'Get started by creating your first event.'
                }
              </p>
              {(!searchQuery && activeFilter === 'all') && (
                <div className="mt-6">
                  <Link
                    to="/ngo/events/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Create Event
                  </Link>
                </div>
              )}
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
    </div>
  )
}

export default NgoEventsPage