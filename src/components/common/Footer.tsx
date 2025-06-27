import { Link } from 'react-router-dom'
import { Waves as Wave, Instagram, Twitter, Facebook } from 'lucide-react'

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <Wave className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-primary-500">Tidewy</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              Connecting volunteers with NGOs for beach cleanup drives in Mumbai.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-600 hover:text-primary-500">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-base text-gray-600 hover:text-primary-500">
                  Join as Volunteer
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-base text-gray-600 hover:text-primary-500">
                  Register NGO
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-primary-500">
                  Beach Locations
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-primary-500">
                  Impact Reports
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-primary-500">
                  Rewards Program
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-primary-500">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-primary-500">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-600 hover:text-primary-500">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Tidewy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer