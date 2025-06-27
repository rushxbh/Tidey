import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Trash2, Award, ArrowRight, MapPin, Coins, TrendingUp, Users, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'

interface Event {
  id: string
  title: string
  date: string
  beach_id: string
  status: string
  beach?: { name: string }
}

interface Stats {
  eventsJoined: number
  wasteCollected: string
  badgesEarned: number
  aquaCoins: number
}

interface Activity {
  id: string
  type: 'event' | 'badge' | 'waste' | 'coins'
  message: string
  time: string
  icon: any
  color: string
}

const beaches = [
  { id: '1', name: 'Juhu Beach' },
  { id: '2', name: 'Versova Beach' },
  { id: '3', name: 'Dadar Chowpatty' },
  { id: '4', name: 'Girgaon Chowpatty' },
  { id: '5', name: 'Mahim Beach' }
]

function VolunteerDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    eventsJoined: 0,
    wasteCollected: '0 kg',
    badgesEarned: 0,
    aquaCoins: 0
  })
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
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
      
      // Filter upcoming events and add beach names
      const upcoming = allEvents
        .filter((event: Event) => new Date(event.date) > new Date())
        .slice(0, 3)
        .map((event: Event) => ({
          ...event,
          beach: beaches.find(b => b.id === event.beach_id)
        }))

      setUpcomingEvents(upcoming)

      // Mock recent activity
      const activities: Activity[] = [
        {
          id: '1',
          type: 'badge',
          message: 'Earned the Beach Guardian badge',
          time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          icon: Award,
          color: 'bg-yellow-500'
        },
        {
          id: '2',
          type: 'waste',
          message: 'Collected 5kg of plastic at Juhu Beach',
          time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          icon: Trash2,
          color: 'bg-green-500'
        },
        {
          id: '3',
          type: 'event',
          message: 'Registered for Versova Weekend Cleanup',
          time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          icon: Calendar,
          color: 'bg-blue-500'
        },
        {
          id: '4',
          type: 'coins',
          message: 'Earned 50 AquaCoins for participation',
          time: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          icon: Coins,
          color: 'bg-purple-500'
        }
      ]

      setRecentActivity(activities)
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
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Volunteer'}!</h1>
            <p className="text-primary-100 text-lg">
              Ready to make a difference? Track your impact and find new cleanup events.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-24 w-24 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Events Joined</p>
                <p className="text-2xl font-bold text-gray-900">{stats.eventsJoined}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Waste Collected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.wasteCollected}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Badges Earned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.badgesEarned}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">AquaCoins</p>
                <p className="text-2xl font-bold text-gray-900">{stats.aquaCoins}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
            <Link
              to="/volunteer/events"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center transition-colors duration-200"
            >
              Find more events
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-shrink-0 h-12 w-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                      <div className="flex items-center mt-1 space-x-4">
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="text-xs">{event.beach?.name}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span className="text-xs">{format(new Date(event.date), 'MMM d, p')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                <p className="text-gray-500 mb-6">
                  You haven't registered for any upcoming events yet.
                </p>
                <Link
                  to="/volunteer/events"
                  className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-md"
                >
                  Find events
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, index) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {index !== recentActivity.length - 1 && (
                          <span className="absolute top-4 left-6 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-12 w-12 rounded-xl ${activity.color} flex items-center justify-center ring-8 ring-white shadow-lg`}>
                              <activity.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {format(new Date(activity.time), 'MMM d')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VolunteerDashboardPage