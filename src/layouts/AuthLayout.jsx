import { Outlet } from 'react-router-dom'
import { Waves as Wave } from 'lucide-react'
import { Link } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Link to="/" className="flex items-center justify-center">
            <Wave className="h-10 w-10 text-primary-500" />
            <span className="ml-2 text-2xl font-bold text-primary-500">Tidewy</span>
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Welcome to Tidewy
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <Outlet />
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}>
        <div className="h-full w-full bg-primary-900 bg-opacity-50 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl font-bold mb-6">Join the Movement</h1>
          <p className="text-xl max-w-md text-center">
            Help clean Mumbai's beaches and make a difference for our oceans and marine life.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout