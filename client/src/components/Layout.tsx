import React from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Waves, 
  Home, 
  Calendar, 
  User, 
  Gift, 
  Building2, 
  LogOut,
  Menu,
  X,
  Trophy,
  Users,
  BarChart3,
  Camera,
  MessageCircle,
  Heart
} from 'lucide-react';
import ChatbotModal from './ChatbotModal';

interface LayoutProps {
  requiredRole?: 'volunteer' | 'ngo';
}

const Layout: React.FC<LayoutProps> = ({ requiredRole }) => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showChatbot, setShowChatbot] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectPath = user.role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  const volunteerNavItems = [
    { icon: Home, label: 'Dashboard', path: '/volunteer/dashboard' },
    { icon: Calendar, label: 'Events', path: '/volunteer/events' },
    { icon: Trophy, label: 'Achievements', path: '/volunteer/achievements' },
    { icon: Gift, label: 'Rewards', path: '/volunteer/rewards' },
    { icon: Heart, label: 'Donations', path: '/volunteer/donations' },
    { icon: User, label: 'Profile', path: '/volunteer/profile' },
  ];

  const ngoNavItems = [
    { icon: Building2, label: 'Dashboard', path: '/ngo/dashboard' },
    { icon: Calendar, label: 'Events', path: '/ngo/events' },
    { icon: Users, label: 'Volunteers', path: '/ngo/volunteers' },
    { icon: BarChart3, label: 'Analytics', path: '/ngo/analytics' },
    { icon: Camera, label: 'Beach Scanner', path: '/ngo/beach-scanner' },
  ];

  const navItems = user.role === 'volunteer' ? volunteerNavItems : ngoNavItems;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Waves className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Tidewy</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            title="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
          {user.role === 'volunteer' && (
            <div className="mb-4 p-3 bg-ocean-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ocean-800">AquaCoins</span>
                <span className="text-lg font-bold text-ocean-600">{user.aquaCoins || 0}</span>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              title="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Waves className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold text-gray-900">Tidewy</span>
            </div>
            <div className="w-10" />
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Chatbot Button - Positioned near bottom right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowChatbot(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
          title="Open Chatbot"
        >
          <MessageCircle className="h-6 w-6" />
        </button>

        {/* Chatbot Modal - Positioned relative to button */}
        {showChatbot && (
          <div className="absolute bottom-16 right-0 z-50">
            <ChatbotModal onClose={() => setShowChatbot(false)} />
          </div>
        )}
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;