import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Trash2, Award, ArrowRight, MapPin, Coins } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'

function VolunteerDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    eventsJoined: 0,
    wasteCollected: '0 kg',
    badgesEarned: 0,
    aquaCoins: 0
  })
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = () => {
    try {
      // Load events from localStorage
      const allEvents = JSON.parse(localStorage.getItem('tidewy_events') || '[]')
      
      // Filter upcoming events (simplified - no registration system)
      const upcoming = allEvents
        .filter(event => new Date(event.date) > new Date())
        .slice(0, 2)

      setUpcomingEvents(upcoming)
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name || 'Volunteer'}!</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your impact and find upcoming beach cleanup events.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-blue-500">
                <Calendar className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Events Joined</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.eventsJoined}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-green-500">
                <Trash2 className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Waste Collected</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.wasteCollected}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-yellow-500">
                <Award className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Badges Earned</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.badgesEarned}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-purple-500">
                <Coins className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">AquaCoins</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.aquaCoins}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
          <Link
            to="/volunteer/events"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
          >
            Find more events
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {upcomingEvents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {upcomingEvents.map((event) => (
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
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming events</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't registered for any upcoming events yet.
              </p>
              <div className="mt-6">
                <Link
                  to="/volunteer/events"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Find events
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VolunteerDashboardPage