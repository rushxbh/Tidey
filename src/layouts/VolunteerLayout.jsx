import { Outlet } from 'react-router-dom'
import VolunteerNavbar from '../components/volunteer/VolunteerNavbar'
import VolunteerBottomNav from '../components/volunteer/VolunteerBottomNav'

function VolunteerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <VolunteerNavbar />
      
      <main className="flex-grow p-4 pt-20 pb-20">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      <VolunteerBottomNav />
    </div>
  )
}

export default VolunteerLayout