import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Clock, Users, Info, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Beach {
  id: string
  name: string
}

interface FormData {
  title: string
  description: string
  date: string
  start_time: string
  beach_id: string
  max_volunteers: number
  meeting_point: string
  equipment_provided: boolean
  equipment_details: string
  waste_categories: string[]
}

const beaches: Beach[] = [
  { id: '1', name: 'Juhu Beach' },
  { id: '2', name: 'Versova Beach' },
  { id: '3', name: 'Dadar Chowpatty' },
  { id: '4', name: 'Girgaon Chowpatty' },
  { id: '5', name: 'Mahim Beach' }
]

function NgoCreateEventPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    start_time: '',
    beach_id: '',
    max_volunteers: 50,
    meeting_point: '',
    equipment_provided: true,
    equipment_details: 'Gloves, bags, and basic collection tools will be provided.',
    waste_categories: ['plastic', 'glass', 'metal', 'organic']
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleWasteCategoryChange = (category: string) => {
    setFormData(prev => {
      const categories = [...prev.waste_categories]
      if (categories.includes(category)) {
        return {
          ...prev,
          waste_categories: categories.filter(c => c !== category)
        }
      } else {
        return {
          ...prev,
          waste_categories: [...categories, category]
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      // Validate required fields
      if (!formData.title || !formData.date || !formData.start_time || !formData.beach_id) {
        throw new Error('Please fill in all required fields')
      }

      // Combine date and time
      const eventDateTime = new Date(`${formData.date}T${formData.start_time}`)
      
      if (eventDateTime <= new Date()) {
        throw new Error('Event date must be in the future')
      }

      // Prepare event data
      const eventData = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        date: eventDateTime.toISOString(),
        beach_id: formData.beach_id,
        ngo_id: user?.id,
        max_volunteers: parseInt(formData.max_volunteers.toString()),
        meeting_point: formData.meeting_point,
        equipment_provided: formData.equipment_provided,
        equipment_details: formData.equipment_details,
        waste_categories: formData.waste_categories,
        status: 'upcoming',
        registered_volunteers: 0,
        created_at: new Date().toISOString()
      }

      // Store event in localStorage
      const existingEvents = JSON.parse(localStorage.getItem('tidewy_events') || '[]')
      existingEvents.push(eventData)
      localStorage.setItem('tidewy_events', JSON.stringify(existingEvents))
      
      // Navigate to events list
      navigate('/ngo/events')
    } catch (error) {
      console.error('Error creating event:', error)
      setError((error as Error).message || 'Failed to create event')
      setIsLoading(false)
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Info className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g., Juhu Beach Weekend Cleanup"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Describe the event, what volunteers should expect, and any specific goals."
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                Start Time *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Clock className="h-4 w-4" />
                </span>
                <input
                  type="time"
                  name="start_time"
                  id="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="beach_id" className="block text-sm font-medium text-gray-700">
                Beach Location *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <MapPin className="h-4 w-4" />
                </span>
                <select
                  id="beach_id"
                  name="beach_id"
                  value={formData.beach_id}
                  onChange={handleChange}
                  required
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select a beach</option>
                  {beaches.map((beach) => (
                    <option key={beach.id} value={beach.id}>
                      {beach.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="max_volunteers" className="block text-sm font-medium text-gray-700">
                Max Volunteers *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Users className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  name="max_volunteers"
                  id="max_volunteers"
                  min="1"
                  max="500"
                  value={formData.max_volunteers}
                  onChange={handleChange}
                  required
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g., 50"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="meeting_point" className="block text-sm font-medium text-gray-700">
                Meeting Point
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="meeting_point"
                  id="meeting_point"
                  value={formData.meeting_point}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g., Near beach entrance, opposite landmark"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="equipment_provided"
                    name="equipment_provided"
                    type="checkbox"
                    checked={formData.equipment_provided}
                    onChange={handleChange}
                    className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="equipment_provided" className="font-medium text-gray-700">Equipment Provided</label>
                  <p className="text-gray-500">Check this if you will provide cleanup equipment to volunteers</p>
                </div>
              </div>
            </div>

            {formData.equipment_provided && (
              <div className="sm:col-span-6">
                <label htmlFor="equipment_details" className="block text-sm font-medium text-gray-700">
                  Equipment Details
                </label>
                <div className="mt-1">
                  <textarea
                    id="equipment_details"
                    name="equipment_details"
                    rows={2}
                    value={formData.equipment_details}
                    onChange={handleChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe what equipment will be provided"
                  />
                </div>
              </div>
            )}

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700">
                Waste Categories
              </label>
              <p className="text-sm text-gray-500">Select the types of waste that will be collected</p>
              <div className="mt-2 space-y-2">
                {['plastic', 'glass', 'metal', 'organic'].map((category) => (
                  <div key={category} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={category}
                        type="checkbox"
                        checked={formData.waste_categories.includes(category)}
                        onChange={() => handleWasteCategoryChange(category)}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={category} className="font-medium text-gray-700">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/ngo/events')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default NgoCreateEventPage