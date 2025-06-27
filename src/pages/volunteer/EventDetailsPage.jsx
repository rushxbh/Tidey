import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Trash2, ArrowLeft, QrCode, Camera } from 'lucide-react'
import { format } from 'date-fns'

// Mock data
const mockEvent = {
  id: 1,
  title: 'Juhu Beach Cleanup',
  date: new Date(2023, 5, 15, 8, 0),
  endTime: new Date(2023, 5, 15, 11, 0),
  location: 'Juhu Beach',
  meetingPoint: 'Near Juhu Beach entrance, opposite Hotel Sea Princess',
  description: `Join us for our monthly cleanup at Juhu Beach. We'll be focusing on the northern section. This event is suitable for all ages and experience levels. We'll provide gloves and bags, but feel free to bring your own reusable equipment if you prefer.`,
  organizer: 'Beach Please',
  maxVolunteers: 50,
  registeredVolunteers: 24,
  status: 'upcoming',
  contactPerson: 'Rahul Sharma',
  contactPhone: '+91 98765 43210',
  wasteCategories: ['plastic', 'glass', 'metal', 'organic'],
  equipmentProvided: true,
  equipmentDetails: 'Gloves, bags, and basic collection tools will be provided.',
  isRegistered: true,
  isCheckedIn: false,
}

function VolunteerEventDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showWasteForm, setShowWasteForm] = useState(false)
  const [wasteData, setWasteData] = useState({
    plastic: '',
    glass: '',
    metal: '',
    organic: '',
    photo: null,
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvent(mockEvent)
      setLoading(false)
    }, 500)
  }, [id])

  const handleRegister = () => {
    setEvent(prev => ({
      ...prev,
      isRegistered: true,
      registeredVolunteers: prev.registeredVolunteers + 1
    }))
  }

  const handleCancelRegistration = () => {
    setEvent(prev => ({
      ...prev,
      isRegistered: false,
      registeredVolunteers: prev.registeredVolunteers - 1
    }))
  }

  const handleCheckIn = () => {
    setEvent(prev => ({
      ...prev,
      isCheckedIn: true
    }))
    setShowQRScanner(false)
  }

  const handleWasteInputChange = (e) => {
    const { name, value } = e.target
    setWasteData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setWasteData(prev => ({
        ...prev,
        photo: URL.createObjectURL(e.target.files[0])
      }))
    }
  }

  const handleWasteSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would submit the waste data to the server
    alert('Waste data submitted successfully!')
    setShowWasteForm(false)
  }

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
          onClick={() => navigate('/volunteer/events')}
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
          onClick={() => navigate('/volunteer/events')}
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
          <div>
            {event.isRegistered ? (
              <div className="flex space-x-2">
                {event.isCheckedIn ? (
                  <button
                    onClick={() => setShowWasteForm(true)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Log Waste
                  </button>
                ) : (
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    Check In
                  </button>
                )}
                <button
                  onClick={handleCancelRegistration}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleRegister}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Register
              </button>
            )}
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
                <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <p className="text-sm text-gray-900">{event.description}</p>
                </div>
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Organizer:</span>
                <span className="ml-2 text-sm text-gray-900">{event.organizer}</span>
              </div>
            </div>
            <div className="sm:col-span-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Contact:</span>
                <span className="ml-2 text-sm text-gray-900">{event.contactPerson}, {event.contactPhone}</span>
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
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowQRScanner(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
                  <QrCode className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Scan QR Code</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Scan the QR code at the event location to check in.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center h-48">
                  <p className="text-gray-500">Camera would activate here in a real app</p>
                </div>
                <button
                  type="button"
                  className="mt-3 inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                  onClick={handleCheckIn}
                >
                  Simulate Successful Scan
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                  onClick={() => setShowQRScanner(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waste Logging Modal */}
      {showWasteForm && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowWasteForm(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
                  <Trash2 className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Log Waste Collection</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Record the amount of waste you collected during the cleanup.
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleWasteSubmit} className="mt-5 sm:mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plastic" className="block text-sm font-medium text-gray-700">
                      Plastic (kg)
                    </label>
                    <input
                      type="number"
                      id="plastic"
                      name="plastic"
                      min="0"
                      step="0.1"
                      value={wasteData.plastic}
                      onChange={handleWasteInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="glass" className="block text-sm font-medium text-gray-700">
                      Glass (kg)
                    </label>
                    <input
                      type="number"
                      id="glass"
                      name="glass"
                      min="0"
                      step="0.1"
                      value={wasteData.glass}
                      onChange={handleWasteInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="metal" className="block text-sm font-medium text-gray-700">
                      Metal (kg)
                    </label>
                    <input
                      type="number"
                      id="metal"
                      name="metal"
                      min="0"
                      step="0.1"
                      value={wasteData.metal}
                      onChange={handleWasteInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="organic" className="block text-sm font-medium text-gray-700">
                      Organic (kg)
                    </label>
                    <input
                      type="number"
                      id="organic"
                      name="organic"
                      min="0"
                      step="0.1"
                      value={wasteData.organic}
                      onChange={handleWasteInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Photo of Collected Waste (optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {wasteData.photo ? (
                        <div>
                          <img src={wasteData.photo} alt="Waste preview" className="mx-auto h-32 w-auto" />
                          <button
                            type="button"
                            onClick={() => setWasteData(prev => ({ ...prev, photo: null }))}
                            className="mt-2 text-sm text-red-600 hover:text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                            >
                              <span>Upload a file</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handlePhotoChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowWasteForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VolunteerEventDetailsPage