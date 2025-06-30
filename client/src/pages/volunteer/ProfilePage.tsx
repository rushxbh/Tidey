import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Coins, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface UserStats {
  eventsJoined: number;
  totalHours: number;
  aquaCoins: number;
  achievements: number;
}

const ProfilePage: React.FC = () => {
  const { user} = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });
  const [userStats, setUserStats] = useState<UserStats>({
    eventsJoined: 0,
    totalHours: 0,
    aquaCoins: 0,
    achievements: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserStats();
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await axios.get('/api/users/stats');
      setUserStats(response.data);
    } catch (err: any) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await axios.put('/api/auth/profile', profile);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const achievements = [
    { name: 'First Cleanup', description: 'Completed your first beach cleanup', icon: '🏆', earned: userStats.eventsJoined > 0 },
    { name: 'Team Player', description: 'Joined 5 team cleanup events', icon: '👥', earned: userStats.eventsJoined >= 5 },
    { name: 'Ocean Guardian', description: 'Volunteered for 20+ hours', icon: '🌊', earned: userStats.totalHours >= 20 },
    { name: 'Early Bird', description: 'Earned 500+ AquaCoins', icon: '🌅', earned: userStats.aquaCoins >= 500 },
    { name: 'Weekend Warrior', description: 'Participated in 10 events', icon: '⚡', earned: userStats.eventsJoined >= 10 },
    { name: 'Eco Champion', description: 'Volunteered for 50+ hours', icon: '♻️', earned: userStats.totalHours >= 50 }
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary-600" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">Volunteer</p>
                <div className="flex items-center mt-2">
                  <Coins className="h-4 w-4 text-ocean-600 mr-1" />
                  <span className="text-ocean-600 font-semibold">{userStats.aquaCoins} AquaCoins</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{profile.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Enter your location"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.location || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="input-field"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">{profile.bio || 'No bio provided'}</p>
                )}
              </div>

              {user.createdAt && (
  <div className="flex items-center text-sm text-gray-600">
    <Calendar className="h-4 w-4 mr-2" />
    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
  </div>
)}

            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    achievement.earned
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      {achievement.earned && (
                        <span className="text-xs text-green-600 font-medium">✓ Earned</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Impact Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Events Joined</span>
                <span className="font-semibold text-gray-900">{userStats.eventsJoined}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hours Volunteered</span>
                <span className="font-semibold text-gray-900">{userStats.totalHours}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">AquaCoins Earned</span>
                <span className="font-semibold text-gray-900">{userStats.aquaCoins}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Achievements</span>
                <span className="font-semibold text-gray-900">{achievements.filter(a => a.earned).length}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">AquaCoins Balance</h3>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-8 w-8 text-ocean-600 mr-2" />
                <span className="text-3xl font-bold text-ocean-600">{userStats.aquaCoins}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">Available for rewards</p>
              <button className="w-full btn-primary">
                Visit Rewards Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;