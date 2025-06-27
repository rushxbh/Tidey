import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Trash2, ArrowLeft, QrCode, Camera, Upload, CheckCircle, Play, XCircle } from 'lucide-react'
import { format, isAfter, isBefore, addHours } from 'date-fns'

interface Beach {
  id: string
  name: string
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  beach_id: string
  max_volunteers: number
  meeting_point?: string
  equipment_provided?: boolean
  equipment_details?: string
  waste_categories?: string[]
  status: 'upcoming' | 'live' | 'ended'
  beach?: Beach
}

interface WasteData {
  plastic: string
  glass: string
  metal: string
  organic: string
  photo: string | null
}

interface BCIImageData {
  beforeImage: string | null
  afterImage: string | null
  notes: string
}

const beaches: Beach[] = [
  { id: '1', name: 'Juhu Beach' },
  { id: '2', name: 'Versova Beach' },
  { id: '3', name: 'Dadar Chowpatty' },
  { id: '4', name: 'Girgaon Chowpatty' },
  { id: '5', name: 'Mahim Beach' }
]

function VolunteerEventDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showWasteForm, setShowWasteForm] = useState(false)
  const [showBCIForm, setShowBCIForm] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [hasSubmittedWaste, setHasSubmittedWaste] = useState(false)
  const [hasSubmittedBCI, setHasSubmittedBCI] = useState(false)
  const [wasteData, setWasteData] = useState<WasteData>({
    plastic: '',
    glass: '',
    metal: '',
    organic: '',
    photo: null,
  })
  const [bciData, setBciData] = useState<BCIImageData>({
    beforeImage: null,
    afterImage: null,
    notes: ''
  })

  useEffect(() => {
    loadEvent()
  }, [id])

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

  const loadEvent = () => {
    try {
      const eventsData = JSON.parse(localStorage.getItem('tidewy_events') || '[]')
      const foundEvent = eventsData.find((e: Event) => e.id === id)
      
      if (foundEvent) {
        const eventWithBeach = {
          ...foundEvent,
          beach: beaches.find(b => b.id === foundEvent.beach_id),
          status: getEventStatus(foundEvent.date)
        }
        setEvent(eventWithBeach)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading event:', error)
      setLoading(false)
    }
  }

  const handleRegister = () => {
    setIsRegistered(true)
  }

  const handleCancelRegistration = () => {
    setIsRegistered(false)
    setIsCheckedIn(false)
    setHasSubmittedWaste(false)
    setHasSubmittedBCI(false)
  }

  const handleCheckIn = () => {
    setIsCheckedIn(true)
    setShowQRScanner(false)
  }

  const handleWasteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setWasteData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleWastePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setWasteData(prev => ({
        ...prev,
        photo: URL.createObjectURL(e.target.files[0])
      }))
    }
  }

  const handleBCIImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'beforeImage' | 'afterImage') => {
    if (e.target.files && e.target.files[0]) {
      setBciData(prev => ({
        ...prev,
        [type]: URL.createObjectURL(e.target.files[0])
      }))
    }
  }

  const handleWasteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSubmittedWaste(true)
    setShowWasteForm(false)
    alert('Waste data submitted successfully!')
  }

  const handleBCISubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHasSubmittedBCI(true)
    setShowBCIForm(false)
    alert('BCI images submitted successfully! This will help improve our beach cleanliness index.')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-5 w-5" />
      case 'live':
        return <Play className="h-5 w-5" />
      case 'ended':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <XCircle className="h-5 w-5" />
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

  if (!event) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Event not found</h2>
        <p className="text-gray-500 mb-8">The event you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/volunteer/events')}
          className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-all duration-200"
        >
          Back to Events
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/volunteer/events')}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{event.beach?.name}</span>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
              {getStatusIcon(event.status)}
              <span className="ml-1 capitalize">{event.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-4">
          {!isRegistered ? (
            <button
              onClick={handleRegister}
              className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-md"
            >
              Register for Event
            </button>
          ) : (
            <>
              {!isCheckedIn && event.status === 'live' && (
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-all duration-200 shadow-md"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Check In
                </button>
              )}
              
              {isCheckedIn && !hasSubmittedWaste && (
                <button
                  onClick={() => setShowWasteForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all duration-200 shadow-md"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Log Waste Collection
                </button>
              )}
              
              {isCheckedIn && event.status === 'ended' && !hasSubmittedBCI && (
                <button
                  onClick={() => setShowBCIForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-all duration-200 shadow-md"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Submit BCI Images
                </button>
              )}
              
              <button
                onClick={handleCancelRegistration}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                Cancel Registration
              </button>
            </>
          )}
        </div>
        
        {/* Status Messages */}
        {isRegistered && (
          <div className="mt-4 space-y-2">
            {isCheckedIn && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">You're checked in to this event</span>
              </div>
            )}
            {hasSubmittedWaste && (
              <div className="flex items-center text-blue-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">Waste collection data submitted</span>
              </div>
            )}
            {hasSubmittedBCI && (
              <div className="flex items-center text-purple-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">BCI images submitted</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <span className="text-sm text-gray-500">Date & Time</span>
                  <p className="text-gray-900 font-medium">{format(new Date(event.date), 'PPP')} at {format(new Date(event.date), 'p')}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <span className="text-sm text-gray-500">Location</span>
                  <p className="text-gray-900 font-medium">{event.beach?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <span className="text-sm text-gray-500">Capacity</span>
                  <p className="text-gray-900 font-medium">{event.max_volunteers} volunteers</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {event.meeting_point && (
                <div>
                  <span className="text-sm text-gray-500">Meeting Point</span>
                  <p className="text-gray-900">{event.meeting_point}</p>
                </div>
              )}
              
              <div>
                <span className="text-sm text-gray-500">Organizer</span>
                <p className="text-gray-900 font-medium">Beach Please NGO</p>
              </div>
            </div>
          </div>
          
          {event.description && (
            <div className="mt-6">
              <span className="text-sm text-gray-500">Description</span>
              <p className="text-gray-900 mt-1">{event.description}</p>
            </div>
          )}
          
          {event.waste_categories && event.waste_categories.length > 0 && (
            <div className="mt-6">
              <span className="text-sm text-gray-500">Waste Categories</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {event.waste_categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {event.equipment_provided && event.equipment_details && (
            <div className="mt-6">
              <span className="text-sm text-gray-500">Equipment Provided</span>
              <p className="text-gray-900 mt-1">{event.equipment_details}</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setShowQRScanner(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
              <div>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100">
                  <QrCode className="h-8 w-8 text-primary-600" aria-hidden="true" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">Scan QR Code</h3>
                  <div className="mt-2">
                    <p className="text-gray-500">
                      Scan the QR code at the event location to check in.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="bg-gray-100 p-8 rounded-xl flex items-center justify-center h-48">
                  <p className="text-gray-500">Camera would activate here in a real app</p>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleCheckIn}
                >
                  Simulate Successful Scan
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setShowWasteForm(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-100">
                  <Trash2 className="h-8 w-8 text-blue-600" aria-hidden="true" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">Log Waste Collection</h3>
                  <div className="mt-2">
                    <p className="text-gray-500">
                      Record the amount of waste you collected during the cleanup.
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleWasteSubmit} className="mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plastic" className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="glass" className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="metal" className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="organic" className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo of Collected Waste (optional)
                  </label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                    <div className="space-y-1 text-center">
                      {wasteData.photo ? (
                        <div>
                          <img src={wasteData.photo} alt="Waste preview" className="mx-auto h-32 w-auto rounded-lg" />
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
                              htmlFor="waste-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                            >
                              <span>Upload a file</span>
                              <input id="waste-upload" name="waste-upload" type="file" className="sr-only" onChange={handleWastePhotoChange} />
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
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setShowWasteForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* BCI Image Upload Modal */}
      {showBCIForm && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-900 opacity-75" onClick={() => setShowBCIForm(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-purple-100">
                  <Camera className="h-8 w-8 text-purple-600" aria-hidden="true" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">Submit BCI Images</h3>
                  <div className="mt-2">
                    <p className="text-gray-500">
                      Help us improve our Beach Cleanliness Index by uploading before and after photos of the cleanup area.
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleBCISubmit} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Before Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Before Cleanup Image
                    </label>
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                      <div className="space-y-1 text-center">
                        {bciData.beforeImage ? (
                          <div>
                            <img src={bciData.beforeImage} alt="Before cleanup" className="mx-auto h-32 w-auto rounded-lg" />
                            <button
                              type="button"
                              onClick={() => setBciData(prev => ({ ...prev, beforeImage: null }))}
                              className="mt-2 text-sm text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="before-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                              >
                                <span>Upload</span>
                                <input 
                                  id="before-upload" 
                                  name="before-upload" 
                                  type="file" 
                                  className="sr-only" 
                                  onChange={(e) => handleBCIImageChange(e, 'beforeImage')} 
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* After Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      After Cleanup Image
                    </label>
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                      <div className="space-y-1 text-center">
                        {bciData.afterImage ? (
                          <div>
                            <img src={bciData.afterImage} alt="After cleanup" className="mx-auto h-32 w-auto rounded-lg" />
                            <button
                              type="button"
                              onClick={() => setBciData(prev => ({ ...prev, afterImage: null }))}
                              className="mt-2 text-sm text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="after-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                              >
                                <span>Upload</span>
                                <input 
                                  id="after-upload" 
                                  name="after-upload" 
                                  type="file" 
                                  className="sr-only" 
                                  onChange={(e) => handleBCIImageChange(e, 'afterImage')} 
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={bciData.notes}
                    onChange={(e) => setBciData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any observations about the cleanup area, challenges faced, or improvements noticed..."
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    onClick={() => setShowBCIForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Submit Images
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