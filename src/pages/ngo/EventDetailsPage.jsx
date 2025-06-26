import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Trash2, Edit, ArrowLeft, Download, QrCode, Info } from 'lucide-react'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import QRCode from 'qrcode.react'

// Mock data
const mockEvent = {
  id: 1,
  title: 'Juhu Beach Cleanup',
  date: new Date(2023, 5, 15, 8, 0),
  endTime: new Date(2023, 5, 15, 11, 0),
  location: 'Juhu Beach',
  meetingPoint: 'Near Juhu Beach entrance, opposite Hotel Sea Princess',
  description: `Join us for our monthly cleanup at Juhu Beach. We'll be focusing on the northern section. This event is suitable for all ages and experience levels. We'll provide gloves and bags, but feel free to bring your own reusable equipment if you prefer.`,
  maxVolunteers: 50,
  registeredVolunteers: 24,
  status: 'upcoming',
  contactPerson: 'Rahul Sharma',
  contactPhone: '+91 98765 43210',
  wasteCategories: ['plastic', 'glass', 'metal', 'organic'],
  equipmentProvided: true,
  equipmentDetails: 'Gloves, bags, and basic collection tools will be provided.',
  isRecurring: true,
  recurringType: 'monthly',
}

const mockVolunteers = [
  { id: 1, name: 'Priya Patel', email: 'priya@example.com', phone: '+91 98765 12345', status: 'confirmed' },
  { id: 2, name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 87654 32109', status: 'confirmed' },
  { id: 3, name: 'Neha Singh', email: 'neha@example.com', phone: '+91 76543 21098', status: 'confirmed' },
  { id: 4, name: 'Raj Malhotra', email: 'raj@example.com', phone: '+91 65432 10987', status: 'pending' },
  { id: 5, name: 'Sanjay Gupta', email: 'sanjay@example.com', phone: '+91 54321 09876', status: 'confirmed' },
]

const mockWasteData = [
  { name: 'Plastic', value: 65, color: '#0088ff' },
  { name: 'Glass', value: 15, color: '#00ffbd' },
  { name: 'Metal', value: 10, color: '#ffb900' },
  { name: 'Organic', value: 10, color: '#4caf50' },
]

function NgoEventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [volunteers, setVolunteers] = useState([])
  const [wasteData, setWasteData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvent(mockEvent)
      setVolunteers(mockVolunteers)
      setWasteData(mockWasteData)
      setLoading(false)
    }, 500)
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Event not found</h2>
        <p className="mt-2 text-gray-500">The event you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/ngo/events')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Back to Events
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/ngo/events')}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
      </div>

      {/* Event details */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Event Details</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowQRCode(true)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              <QrCode className="h-4 w-4 mr-1" />
              QR Code
            </button>
            <Link
              to={`/ngo/events/${id}/edit`}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Date:</span>
                <span className="ml-2 text-sm text-gray-900">{format(event.date, 'PPP')}</span>
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Time:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {format(event.date, 'p')} - {format(event.endTime, 'p')}
                </span>
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Location:</span>
                <span className="ml-2 text-sm text-gray-900">{event.location}</span>
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">Volunteers:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {event.registeredVolunteers} / {event.maxVolunteers}
                </span>
              </div>
            </div>
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500">Meeting Point:</span>
                  <p className="text-sm text-gray-900">{event.meetingPoint}</p>
                </div>
              </div>
            </div>
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <p className="text-sm text-gray-900">{event.description}</p>
                </div>
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Contact Person:</span>
                <span className="ml-2 text-sm text-gray-900">{event.contactPerson}</span>
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Contact Phone:</span>
                <span className="ml-2 text-sm text-gray-900">{event.contactPhone}</span>
              </div>
            </div>
            <div className="sm:col-span-6">
              <div className="flex items-start">
                <span className="text-sm text-gray-500">Waste Categories:</span>
                <div className="ml-2 flex flex-wrap gap-2">
                  {event.wasteCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {event.equipmentProvided && (
              <div className="sm:col-span-6">
                <div className="flex items-start">
                  <span className="text-sm text-gray-500">Equipment:</span>
                  <p className="ml-2 text-sm text-gray-900">{event.equipmentDetails}</p>
                </div>
              </div>
            )}
            {event.isRecurring && (
              <div className="sm:col-span-6">
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Recurrence:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {event.recurringType.charAt(0).toUpperCase() + event.recurringType.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Volunteers */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Registered Volunteers</h2>
          <button
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {volunteers.map((volunteer) => (
                  <tr key={volunteer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{volunteer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{volunteer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        volunteer.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Waste Collection */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Waste Collection</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {event.status === 'upcoming' ? (
            <div className="text-center py-8">
              <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No waste data yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Waste collection data will be available after the event.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Waste by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wasteData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {wasteData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} kg`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Summary</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Total Waste Collected</dt>
                    <dd className="mt-1 text-sm text-gray-900">100 kg</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Volunteers Participated</dt>
                    <dd className="mt-1 text-sm text-gray-900">24</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Average per Volunteer</dt>
                    <dd className="mt-1 text-sm text-gray-900">4.17 kg</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="mt-1 text-sm text-gray-900">3 hours</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowQRCode(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
                  <QrCode className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Event Check-in QR Code</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Volunteers can scan this QR code to check in at the event.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-center">
                <div className="p-2 bg-white rounded-lg">
                  <QRCode 
                    value={`https://tidewy.com/event-checkin/${event.id}`} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                  onClick={() => setShowQRCode(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NgoEventDetailsPage