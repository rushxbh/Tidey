import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Camera, Edit, Save, Award, Trash2 } from 'lucide-react'

// Mock data
const mockUserData = {
  name: 'Priya Patel',
  email: 'priya@example.com',
  phone: '+91 98765 12345',
  age: 28,
  area: 'Andheri',
  interests: ['beach-cleanup', 'marine-conservation', 'waste-management'],
  joinedDate: '2023-01-15',
  profileImage: null,
}

const mockStats = {
  eventsJoined: 8,
  wasteCollected: 45,
  badgesEarned: 5,
  aquaCoins: 350,
}

function VolunteerProfilePage() {
  const { user } = useAuth()
  const [userData, setUserData] = useState(null)
  const [stats, setStats] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUserData(mockUserData)
      setStats(mockStats)
      setFormData(mockUserData)
      setLoading(false)
    }, 500)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInterestChange = (interest) => {
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

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target.result
        }))
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Profile Overview */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center">
          <div className="flex-shrink-0 mb-4 sm:mb-0">
            <div className="relative">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold">
                  {userData.name.charAt(0)}
                </div>
              )}
              {isEditing && (
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center cursor-pointer"
                >
                  <Camera className="h-4 w-4 text-white" />
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
          <div className="sm:ml-6 flex-1">
            <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
            <p className="text-sm text-gray-500">Member since {new Date(userData.joinedDate).toLocaleDateString()}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {userData.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {interest.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="age"
                      id="age"
                      min="13"
                      max="100"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                    Area in Mumbai
                  </label>
                  <div className="mt-1">
                    <select
                      id="area"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Interests
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="beach-cleanup"
                          type="checkbox"
                          checked={formData.interests.includes('beach-cleanup')}
                          onChange={() => handleInterestChange('beach-cleanup')}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="beach-cleanup" className="font-medium text-gray-700">Beach Cleanup</label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="marine-conservation"
                          type="checkbox"
                          checked={formData.interests.includes('marine-conservation')}
                          onChange={() => handleInterestChange('marine-conservation')}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="marine-conservation" className="font-medium text-gray-700">Marine Conservation</label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="waste-management"
                          type="checkbox"
                          checked={formData.interests.includes('waste-management')}
                          onChange={() => handleInterestChange('waste-management')}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="waste-management" className="font-medium text-gray-700">Waste Management</label>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="environmental-education"
                          type="checkbox"
                          checked={formData.interests.includes('environmental-education')}
                          onChange={() => handleInterestChange('environmental-education')}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="environmental-education" className="font-medium text-gray-700">Environmental Education</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
              </div>
              <div className="sm:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1 text-sm text-gray-900">{userData.phone}</p>
              </div>
              <div className="sm:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Age</h3>
                <p className="mt-1 text-sm text-gray-900">{userData.age}</p>
              </div>
              <div className="sm:col-span-3">
                <h3 className="text-sm font-medium text-gray-500">Area</h3>
                <p className="mt-1 text-sm text-gray-900">{userData.area}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Your Impact</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Events Joined</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.eventsJoined}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Waste Collected</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.wasteCollected} kg</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Badges Earned</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.badgesEarned}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">AquaCoins</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.aquaCoins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="border-t border-gray-200">
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <Award className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Earned the <span className="font-medium text-gray-900">Beach Guardian</span> badge
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        2d ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <Trash2 className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Collected <span className="font-medium text-gray-900">5kg of plastic</span> at Juhu Beach Cleanup
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        5d ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-0">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                        <Calendar className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Registered for <span className="font-medium text-gray-900">Versova Weekend Cleanup</span>
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        1w ago
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VolunteerProfilePage