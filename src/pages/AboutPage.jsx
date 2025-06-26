import { Link } from 'react-router-dom'

function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-primary-500 py-16">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.pexels.com/photos/3560044/pexels-photo-3560044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Beach cleanup"
          />
          <div className="absolute inset-0 bg-primary-500 mix-blend-multiply" aria-hidden="true"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">About Tidewy</h1>
          <p className="mt-6 max-w-3xl text-xl text-white">
            Connecting volunteers with NGOs to clean Mumbai's beaches and protect our marine ecosystems.
          </p>
        </div>
      </div>

      {/* Mission section */}
      <div className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Our Mission</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Cleaner beaches for a healthier ocean
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Tidewy was founded with a simple mission: to connect passionate volunteers with dedicated NGOs working to clean Mumbai's beaches. We believe that by making it easier to participate in beach cleanups, we can create a significant positive impact on our marine environment.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Our platform streamlines the process of finding, joining, and tracking beach cleanup events, making it simple for anyone to contribute to this important cause.
              </p>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="pl-4 -mr-48 sm:pl-6 md:-mr-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <img
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:left-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="https://images.pexels.com/photos/2990644/pexels-photo-2990644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Beach cleanup volunteers"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Problem section */}
      <div className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="lg:order-2">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">The Problem</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Mumbai's beaches need our help
              </p>
              <p className="mt-4 text-lg text-gray-500">
                Mumbai's beaches face significant pollution challenges, with thousands of tons of waste washing up on the shores each year. This pollution not only affects the beauty of our coastlines but also harms marine life and ecosystems.
              </p>
              <p className="mt-4 text-lg text-gray-500">
                While many NGOs and volunteer groups are working tirelessly to address this issue, coordination between these groups and potential volunteers has been a challenge. Tidewy aims to bridge this gap.
              </p>
            </div>
            <div className="mt-12 lg:mt-0 lg:order-1">
              <div className="pr-4 -ml-48 sm:pr-6 md:-ml-16 lg:px-0 lg:m-0 lg:relative lg:h-full">
                <img
                  className="w-full rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 lg:absolute lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="https://images.pexels.com/photos/2421548/pexels-photo-2421548.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Beach pollution"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple steps to make a big impact
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform makes it easy for both NGOs and volunteers to coordinate beach cleanup efforts.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <h3 className="text-lg leading-6 font-medium text-gray-900">For NGOs</h3>
                <ul className="mt-2 text-base text-gray-500 list-disc pl-5 space-y-2">
                  <li>Create and manage cleanup events</li>
                  <li>Track volunteer attendance with QR codes</li>
                  <li>Monitor waste collection data</li>
                  <li>Generate impact reports</li>
                  <li>Engage with volunteers</li>
                </ul>
              </div>

              <div className="relative">
                <h3 className="text-lg leading-6 font-medium text-gray-900">For Volunteers</h3>
                <ul className="mt-2 text-base text-gray-500 list-disc pl-5 space-y-2">
                  <li>Find nearby cleanup events</li>
                  <li>Register with a simple form</li>
                  <li>Check in at events with QR codes</li>
                  <li>Log waste collection data</li>
                  <li>Earn rewards for participation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beaches section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Our Beaches</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Mumbai's beautiful coastline
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              We currently focus on these five beaches in Mumbai, with plans to expand to more locations.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg shadow-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <img className="h-8 w-8 text-white" src="https://via.placeholder.com/32" alt="Juhu Beach" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Juhu Beach</h3>
                    <p className="mt-5 text-base text-gray-500">
                      One of Mumbai's most popular beaches, facing significant pollution challenges due to high visitor numbers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg shadow-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <img className="h-8 w-8 text-white" src="https://via.placeholder.com/32" alt="Versova Beach" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Versova Beach</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Site of one of the world's largest beach cleanup operations, led by local residents and volunteers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg shadow-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <img className="h-8 w-8 text-white" src="https://via.placeholder.com/32" alt="Dadar Chowpatty" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Dadar Chowpatty</h3>
                    <p className="mt-5 text-base text-gray-500">
                      A beach that has seen significant improvement through regular community cleanup efforts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg shadow-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <img className="h-8 w-8 text-white" src="https://via.placeholder.com/32" alt="Girgaon Chowpatty" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Girgaon Chowpatty</h3>
                    <p className="mt-5 text-base text-gray-500">
                      A popular beach in South Mumbai that requires regular cleanup efforts to maintain its beauty.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg shadow-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <img className="h-8 w-8 text-white" src="https://via.placeholder.com/32" alt="Mahim Beach" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Mahim Beach</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Facing significant pollution challenges from nearby creeks and requires consistent cleanup efforts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to make a difference?</span>
            <span className="block">Join us today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-white">
            Whether you're an NGO organizing cleanups or a volunteer looking to help, Tidewy makes it easy to contribute to cleaner beaches.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link to="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50">
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex">
              <Link to="/login" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage