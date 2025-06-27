import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, MapPin, User, Award, BarChart3 } from 'lucide-react'

function VolunteerBottomNav() {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', href: '/volunteer/dashboard', icon: LayoutDashboard },
    { name: 'Events', href: '/volunteer/events', icon: MapPin },
    { name: 'BCI', href: '/volunteer/bci', icon: BarChart3 },
    { name: 'Profile', href: '/volunteer/profile', icon: User },
    { name: 'Rewards', href: '/volunteer/rewards', icon: Award },
  ]

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-10 md:hidden">
      <div className="grid grid-cols-5">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center py-2 ${
                isActive ? 'text-primary-500' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default VolunteerBottomNav