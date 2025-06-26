import { Outlet } from 'react-router-dom'
import NgoSidebar from '../components/ngo/NgoSidebar'
import NgoHeader from '../components/ngo/NgoHeader'
import { useState } from 'react'

function NgoLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <div className="flex h-screen bg-gray-50">
      <NgoSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <NgoHeader setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default NgoLayout