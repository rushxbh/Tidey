import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Camera, Edit, Save, Award, Trash2, Calendar, TrendingUp, MapPin, Clock } from 'lucide-react'

interface UserData {
  name: string
  email: string
  phone: string
  age: number
  area: string
  interests: string[]
  joinedDate: string
  profileImage: string | null
}

interface Stats {
  eventsJoined: number
  wasteCollected: number
  badgesEarned: number
  aquaCoins: number
}

interface Activity {
  id: string
  type: 'event' | 'badge' | 'waste'
  message: string
  time: string
  icon: any
  color: string
}

// Mock data
const mockUserData: UserData = {
  name: 'Priya Patel',
  email: 'priya@example.com',
  phone: '+91 98765 12345',
  age: 28,
  area: 'Andheri',
  interests: ['beach-cleanup', 'marine-conservation', 'waste-management'],
  joinedDate: '2023-01-15',
  profileImage: null,
}

const mockStats: Stats = {
  eventsJoined: 8,
  wasteCollected: 45,
  badgesEarned: 5,
  aquaCoins: 350,
}

const mockActivity: Activity[] = [
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
    message: 'Collected 5kg of plastic at Juhu Beach Cleanup',
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
  }
]

function VolunteerProfilePage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UserData>({} as UserData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUserData(mockUserData)
      setStats(mockStats)
      setRecentActivity(mockActivity)
      setFormData(mockUserData)
      setLoading(false)
    }, 500)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) : value
    }))
  }

  const handleInterestChange = (interest: string) => {
    setFormData(prev => {
      const interests = [...prev.interests]
      if (interests.includes(interest)) {
        return {
          ...prev,
          interests: interests.filter(i => i !== interest)
        }
      } else {
        return {
          ...prev,
          interests: [...interests, interest]
        }
      }
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }))
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would update the user data on the server
    setUserData(formData)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!userData || !stats) {
    return <div>Error loading profile data</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account and track your environmental impact</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-md"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Profile Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 mb-6 sm:mb-0">
              <div className="relative">
                {formData.profileImage ? (
                  <img
                    src={formData.profileImage}
                    alt="Profile"
                    className="h-32 w-32 rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {userData.name.charAt(0)}
                  </div>
                )}
                {isEditing && (
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    <Camera className="h-5 w-5 text-white" />
                    <input
                      type="file"
                      id="profile-image"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="sm:ml-8 flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{userData.name}</h2>
              <p className="text-gray-500 mb-4">Member since {new Date(userData.joinedDate).toLocaleDateString()}</p>
              <div className="flex flex-wrap gap-2">
                {userData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200"
                  >
                    {interest.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    min="13"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                    Area in Mumbai
                  </label>
                  <select
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select your area</option>
                    <option value="Andheri">Andheri</option>
                    <option value="Bandra">Bandra</option>
                    <option value="Colaba">Colaba</option>
                    <option value="Dadar">Dadar</option>
                    <option value="Juhu">Juhu</option>
                    <option value="Malad">Malad</option>
                    <option value="Versova">Versova</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Interests
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['beach-cleanup', 'marine-conservation', 'waste-management', 'environmental-education'].map((interest) => (
                      <div key={interest} className="flex items-center">
                        <input
                          id={interest}
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={() => handleInterestChange(interest)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={interest} className="ml-3 text-sm font-medium text-gray-700">
                          {interest.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-all duration-200 shadow-md"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                <p className="text-gray-900">{userData.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                <p className="text-gray-900">{userData.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Age</h3>
                <p className="text-gray-900">{userData.age}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Area</h3>
                <p className="text-gray-900">{userData.area}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Your Impact</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.eventsJoined}</p>
              <p className="text-sm text-gray-500">Events Joined</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Trash2 className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.wasteCollected} kg</p>
              <p className="text-sm text-gray-500">Waste Collected</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.badgesEarned}</p>
              <p className="text-sm text-gray-500">Badges Earned</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stats.aquaCoins}</p>
              <p className="text-sm text-gray-500">AquaCoins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== recentActivity.length - 1 && (
                      <span className="absolute top-6 left-6 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex space-x-4">
                      <div>
                        <span className={`h-12 w-12 rounded-xl ${activity.color} flex items-center justify-center ring-8 ring-white shadow-lg`}>
                          <activity.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={activity.time}>
                            {new Date(activity.time).toLocaleDateString()}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VolunteerProfilePage