import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, Trash2, Award, ArrowRight, PlusCircle } from 'lucide-react'
import { format } from 'date-fns'

const beaches = [
  { id: '1', name: 'Juhu Beach' },
  { id: '2', name: 'Versova Beach' },
  { id: '3', name: 'Dadar Chowpatty' },
  { id: '4', name: 'Girgaon Chowpatty' },
  { id: '5', name: 'Mahim Beach' }
]

function NgoDashboardPage() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    volunteers: 0,
    wasteCollected: '0 kg',
    badgesAwarded: 0
  })
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    try {
      // Load events from localStorage
      const events = JSON.parse(localStorage.getItem('tidewy_events') || '[]')
      
      // Add beach names to events
      const eventsWithBeaches = events.map(event => ({
        ...event,
        beach: beaches.find(b => b.id === event.beach_id)
      }))
      
      // Filter upcoming events
      const upcomingEventsData = eventsWithBeaches
        .filter(event => new Date(event.date) > new Date() && event.status === 'upcoming')
        .slice(0, 3)
      
      // Calculate stats
      const totalEvents = events.length
      
      setStats({
        totalEvents,
        volunteers: 0, // No volunteer data in simplified version
        wasteCollected: '0 kg', // No waste data in simplified version
        badgesAwarded: 0 // No badge data in simplified version
      })
      
      setUpcomingEvents(upcomingEventsData)
      
      // Generate recent activity from events
      const activities = events.slice(0, 4).map(event => ({
        type: 'event',
        message: `Event "${event.title}" was created`,
        time: event.created_at || new Date().toISOString(),
        icon: Calendar
      }))
      
      setRecentActivity(activities)
      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'N/A'
      }
      return format(date, 'MMM dd, HH:mm')
    } catch (error) {
      return 'N/A'
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
        <h1 className="text-2xl font-bold text-gray-900">NGO Dashboard</h1>
        <Link
          to="/ngo/events/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-blue-500">
                <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalEvents}</div>
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
                <Users className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Volunteers</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.volunteers}</div>
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
                <Trash2 className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
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
              <div className="flex-shrink-0 rounded-md p-3 bg-purple-500">
                <Award className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Badges Awarded</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.badgesAwarded}</div>
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
            to="/ngo/events"
            className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {upcomingEvents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="py-4 px-4 sm:px-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-primary-100 text-primary-600 rounded-md flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {format(new Date(event.date), 'PPP')} at {format(new Date(event.date), 'p')}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {event.beach?.name}
                      </p>
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
                Create your first event to get started.
              </p>
              <div className="mt-6">
                <Link
                  to="/ngo/events/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Create Event
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-5">
          {recentActivity.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <activity.icon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">{activity.message}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {formatDate(activity.time)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NgoDashboardPage