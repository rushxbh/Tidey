import React, { useState, useEffect } from 'react';
import { Waves, Users, Trophy, ArrowRight, Play, BarChart3, Heart, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeachHealthData {
  location: string;
  score: number;
  lastUpdated: string;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [beachHealthData, setBeachHealthData] = useState<BeachHealthData[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalVolunteers: 0,
    wasteCollected: 0,
    beachesRestored: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    totalEvents: 0,
    totalVolunteers: 0,
    wasteCollected: 0,
    beachesRestored: 0,
  });

  useEffect(() => {
    setIsVisible(true);

    // Mock data for demo
    const mockStats = {
      totalEvents: 156,
      totalVolunteers: 2340,
      wasteCollected: 12500,
      beachesRestored: 45,
    };

    const mockBeachData = [
      { location: "Juhu Beach", score: 78, lastUpdated: "2 hours ago" },
      { location: "Marine Drive", score: 85, lastUpdated: "4 hours ago" },
      { location: "Versova Beach", score: 72, lastUpdated: "1 day ago" },
      { location: "Chowpatty Beach", score: 68, lastUpdated: "6 hours ago" },
    ];

    setStats(mockStats);
    setBeachHealthData(mockBeachData);

    // Animate stats counter
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setAnimatedStats({
          totalEvents: Math.floor(mockStats.totalEvents * progress),
          totalVolunteers: Math.floor(mockStats.totalVolunteers * progress),
          wasteCollected: Math.floor(mockStats.wasteCollected * progress),
          beachesRestored: Math.floor(mockStats.beachesRestored * progress),
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedStats(mockStats);
        }
      }, stepDuration);
    };

    const timeout = setTimeout(animateStats, 500);
    return () => clearTimeout(timeout);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 group">
              <Waves className="h-8 w-8 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                Tidewy
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`space-y-8 transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
            >
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                  Clean Beaches,
                  <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {" "}
                    Brighter Future
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join thousands of volunteers in the largest beach cleanup movement. Earn rewards, track impact, and
                  make a real difference for our oceans.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register?role=volunteer')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl group flex items-center justify-center"
                >
                  Start Volunteering
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => navigate('/register?role=ngo')}
                  className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 group bg-transparent flex items-center justify-center"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Register Organization
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {[
                  { value: animatedStats.totalEvents, suffix: "+", label: "Events" },
                  { value: animatedStats.totalVolunteers, suffix: "+", label: "Volunteers", format: true },
                  { value: animatedStats.wasteCollected / 1000, suffix: "T", label: "Waste Removed", decimal: 1 },
                  { value: animatedStats.beachesRestored, suffix: "+", label: "Beaches Restored" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="text-center group hover:scale-110 transition-all duration-300 cursor-pointer"
                  >
                    <div className="text-3xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                      {stat.format ? stat.value.toLocaleString() : stat.decimal ? stat.value.toFixed(1) : stat.value}
                      {stat.suffix}
                    </div>
                    <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
            >
              <div className="relative group">
                <img
                  src="https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Beach cleanup volunteers"
                  className="rounded-2xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Impact Achieved</div>
                    <div className="text-sm text-gray-600">12.5 tons waste removed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <button
            onClick={() => scrollToSection("beach-health")}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-300 hover:scale-110"
          >
            <ChevronDown className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </section>

      {/* Beach Health Index */}
      <section id="beach-health" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors duration-300">
              Real-time Beach Health Index
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI-powered monitoring system tracking cleanliness and environmental health of beaches across the region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beachHealthData.map((beach, index) => (
              <div
                key={index}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 border-0"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {beach.location}
                    </h3>
                    <BarChart3 className="h-5 w-5 text-gray-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300" />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Health Score</span>
                      <span
                        className={`px-2 py-1 rounded-full text-sm font-medium transition-all duration-300 ${getScoreColor(
                          beach.score
                        )}`}
                      >
                        {beach.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                          beach.score >= 80
                            ? "bg-green-500"
                            : beach.score >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${beach.score}%`,
                          animationDelay: `${index * 200}ms`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                    Updated {beach.lastUpdated}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors duration-300">
              Why Choose Tidewy?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The most comprehensive platform for beach conservation with gamification, real-time tracking, and
              meaningful rewards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Community Driven",
                description:
                  "Connect with like-minded volunteers and organizations working towards cleaner beaches and healthier oceans.",
                color: "blue",
              },
              {
                icon: Trophy,
                title: "Gamified Experience",
                description:
                  "Earn AquaCoins, unlock achievements, and redeem rewards while making a positive environmental impact.",
                color: "green",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description:
                  "Track your impact with detailed analytics, beach health monitoring, and progress visualization.",
                color: "cyan",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group text-center p-8 bg-white hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-4 border-0 shadow-md rounded-lg"
              >
                <div className={`p-4 bg-${feature.color}-100 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full animate-pulse animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl font-bold text-white mb-4 hover:scale-105 transition-transform duration-300">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of volunteers already making an impact. Start your journey towards cleaner beaches today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register?role=volunteer')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              Join as Volunteer
            </button>
            <button
              onClick={() => navigate('/register?role=ngo')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 bg-transparent"
            >
              Register Organization
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 group">
                <Waves className="h-8 w-8 text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-2xl font-bold group-hover:text-blue-400 transition-colors duration-300">
                  Tidewy
                </span>
              </div>
              <p className="text-gray-400">
                Empowering communities to restore and protect our beaches through collaborative action.
              </p>
            </div>

            {[
              {
                title: "Platform",
                links: ["Find Events", "Organizations", "Impact Tracker", "Rewards"],
              },
              {
                title: "Support",
                links: ["Help Center", "Contact Us", "Community", "Feedback"],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Privacy Policy"],
              },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4 hover:text-blue-400 transition-colors duration-300">
                  {section.title}
                </h3>
                <ul className="space-y-2 text-gray-400">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <button className="hover:text-white transition-all duration-300 hover:translate-x-1">
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p className="hover:text-white transition-colors duration-300 flex items-center justify-center">
              &copy; 2024 Tidewy. All rights reserved. Built with{" "}
              <Heart className="inline h-4 w-4 text-red-500 animate-pulse mx-1" /> for ocean conservation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;