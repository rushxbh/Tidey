import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, ArrowLeft, Edit, Trash2, UserCheck, UserX } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  maxVolunteers: number
  registeredVolunteers: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  category: string
  requirements: string[]
  volunteers: Array<{
    id: string
    name: string
    email: string
    status: 'registered' | 'confirmed' | 'attended' | 'no-show'
    registeredAt: string
  }>
}

export default function NgoEventDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'details' | 'volunteers'>('details')

  useEffect(() => {
    // Simulate API call
    const fetchEvent = async () => {
      setLoading(true)
      // Mock data - replace with actual API call
      const mockEvent: Event = {
        id: id || '1',
        title: 'Community Garden Cleanup',
        description: 'Join us for a community garden cleanup event. We will be removing weeds, planting new flowers, and maintaining the garden paths. This is a great opportunity to give back to the community while enjoying the outdoors.',
        date: '2024-02-15',
        time: '09:00',
        location: 'Central Community Garden, 123 Garden Street',
        maxVolunteers: 20,
        registeredVolunteers: 15,
        status: 'upcoming',
        category: 'Environment',
        requirements: ['Comfortable clothing', 'Work gloves (provided)', 'Water bottle'],
        volunteers: [
          {
            id: '1',
            name: 'John Smith',
            email: 'john@example.com',
            status: 'confirmed',
            registeredAt: '2024-01-20T10:00:00Z'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            status: 'registered',
            registeredAt: '2024-01-22T14:30:00Z'
          },
          {
            id: '3',
            name: 'Mike Davis',
            email: 'mike@example.com',
            status: 'confirmed',
            registeredAt: '2024-01-25T09:15:00Z'
          }
        ]
      }
      
      setTimeout(() => {
        setEvent(mockEvent)
        setLoading(false)
      }, 500)
    }

    fetchEvent()
  }, [id])

  const handleStatusUpdate = (volunteerId: string, newStatus: 'confirmed' | 'attended' | 'no-show') => {
    if (!event) return
    
    setEvent({
      ...event,
      volunteers: event.volunteers.map(volunteer =>
        volunteer.id === volunteerId
          ? { ...volunteer, status: newStatus }
          : volunteer
      )
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'registered':
        return 'bg-blue-100 text-blue-800'
      case 'attended':
        return 'bg-purple-100 text-purple-800'
      case 'no-show':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
        <button
          onClick={() => navigate('/ngo/events')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/ngo/events')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Event
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Status</div>
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
            event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
            event.status === 'ongoing' ? 'bg-green-100 text-green-800' :
            event.status === 'completed' ? 'bg-purple-100 text-purple-800' :
            'bg-red-100 text-red-800'
          }`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Volunteers</div>
          <div className="text-2xl font-bold text-gray-900">
            {event.registeredVolunteers}/{event.maxVolunteers}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Category</div>
          <div className="text-lg font-semibold text-gray-900">{event.category}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Confirmed</div>
          <div className="text-2xl font-bold text-green-600">
            {event.volunteers.filter(v => v.status === 'confirmed').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Event Details
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'volunteers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Volunteers ({event.volunteers.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
              <ul className="list-disc list-inside space-y-1">
                {event.requirements.map((requirement, index) => (
                  <li key={index} className="text-gray-700">{requirement}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-medium">{new Date(event.date).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Time</div>
                    <div className="font-medium">{event.time}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-medium">{event.location}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-600">Capacity</div>
                    <div className="font-medium">{event.maxVolunteers} volunteers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'volunteers' && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Registered Volunteers</h3>
            <p className="text-gray-600 mt-1">Manage volunteer registrations and attendance</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volunteer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {event.volunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                        <div className="text-sm text-gray-500">{volunteer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(volunteer.status)}`}>
                        {volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(volunteer.registeredAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {volunteer.status === 'registered' && (
                          <button
                            onClick={() => handleStatusUpdate(volunteer.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          >
                            <UserCheck className="h-4 w-4" />
                            Confirm
                          </button>
                        )}
                        {event.status === 'completed' && volunteer.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(volunteer.id, 'attended')}
                              className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                            >
                              <UserCheck className="h-4 w-4" />
                              Attended
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(volunteer.id, 'no-show')}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            >
                              <UserX className="h-4 w-4" />
                              No Show
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}