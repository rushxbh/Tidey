import { Link, useLocation } from 'react-router-dom'
import { Waves as Wave, LayoutDashboard, Calendar, FileText, Settings, LogOut, X, BarChart3 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface NgoSidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

function NgoSidebar({ sidebarOpen, setSidebarOpen }: NgoSidebarProps) {
  const location = useLocation()
  const { logout } = useAuth()
  
  const navigation = [
    { name: 'Dashboard', href: '/ngo/dashboard', icon: LayoutDashboard },
    { name: 'Events', href: '/ngo/events', icon: Calendar },
    { name: 'BCI Analytics', href: '/ngo/bci', icon: BarChart3 },
    { name: 'Reports', href: '/ngo/reports', icon: FileText },
    { name: 'Settings', href: '/ngo/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Sidebar overlay */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
        
        {/* Sidebar panel */}
        <div className="fixed inset-y-0 left-0 flex flex-col max-w-xs w-full bg-white shadow-xl">
          <div className="h-0 flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-5 pb-4">
              <Link to="/ngo/dashboard" className="flex items-center">
                <Wave className="h-8 w-8 text-primary-500" />
                <span className="ml-2 text-xl font-bold text-primary-500">Tidewy</span>
              </Link>
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-gray-500" aria-hidden="true" />
              </button>
            </div>
            
            <div className="flex-1 px-2 space-y-1 mt-5">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 ${
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={logout}
              className="flex-shrink-0 group block w-full flex items-center"
            >
              <div className="flex items-center">
                <div>
                  <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    Logout
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
              <Link to="/ngo/dashboard" className="flex items-center">
                <Wave className="h-8 w-8 text-primary-500" />
                <span className="ml-2 text-xl font-bold text-primary-500">Tidewy</span>
              </Link>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={logout}
                className="flex-shrink-0 w-full group flex items-center"
              >
                <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NgoSidebar