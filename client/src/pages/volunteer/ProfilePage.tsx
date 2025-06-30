import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Trophy, Coins, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'Los Angeles, CA',
    joinDate: '2023-06-15',
    bio: 'Passionate about ocean conservation and making a positive impact on our beaches.'
  });

  const stats = {
    eventsJoined: 12,
    hoursVolunteered: 48,
    aquaCoins: 1250,
    achievements: 8,
    wasteCollected: '125 kg',
    beachesHelped: 8
  };

  const achievements = [
    { name: 'First Cleanup', description: 'Completed your first beach cleanup', icon: '🏆', earned: true },
    { name: 'Team Player', description: 'Joined 5 team cleanup events', icon: '👥', earned: true },
    { name: 'Ocean Guardian', description: 'Collected 50kg of waste', icon: '🌊', earned: true },
    { name: 'Early Bird', description: 'Joined 3 morning cleanups', icon: '🌅', earned: true },
    { name: 'Weekend Warrior', description: 'Participated in 10 weekend events', icon: '⚡', earned: false },
    { name: 'Eco Champion', description: 'Collected 100kg of waste', icon: '♻️', earned: false }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Save profile logic here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="btn-primary"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-primary-600" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                  <Camera className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-600">Volunteer</p>
                <div className="flex items-center mt-2">
                  <Coins className="h-4 w-4 text-ocean-600 mr-1" />
                  <span className="text-ocean-600 font-semibold">{stats.aquaCoins} AquaCoins</span>
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
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
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
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="input-field"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600">{profile.bio}</p>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
              </div>
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
                <span className="font-semibold text-gray-900">{stats.eventsJoined}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hours Volunteered</span>
                <span className="font-semibold text-gray-900">{stats.hoursVolunteered}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Waste Collected</span>
                <span className="font-semibold text-gray-900">{stats.wasteCollected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Beaches Helped</span>
                <span className="font-semibold text-gray-900">{stats.beachesHelped}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Achievements</span>
                <span className="font-semibold text-gray-900">{stats.achievements}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">AquaCoins Balance</h3>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-8 w-8 text-ocean-600 mr-2" />
                <span className="text-3xl font-bold text-ocean-600">{stats.aquaCoins}</span>
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