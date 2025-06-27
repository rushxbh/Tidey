import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import NgoLayout from './layouts/NgoLayout'
import VolunteerLayout from './layouts/VolunteerLayout'

// Pages
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'

// NGO Pages
import NgoDashboardPage from './pages/ngo/DashboardPage'
import NgoEventsPage from './pages/ngo/EventsPage'
import NgoCreateEventPage from './pages/ngo/CreateEventPage'
import NgoEventDetailsPage from './pages/ngo/EventDetailsPage'
import NgoReportsPage from './pages/ngo/ReportsPage'
import NgoBciPage from './pages/ngo/BciPage'
import NgoSettingsPage from './pages/ngo/SettingsPage'

// Volunteer Pages
import VolunteerDashboardPage from './pages/volunteer/DashboardPage'
import VolunteerEventsPage from './pages/volunteer/EventsPage'
import VolunteerEventDetailsPage from './pages/volunteer/EventDetailsPage'
import VolunteerProfilePage from './pages/volunteer/ProfilePage'
import VolunteerRewardsPage from './pages/volunteer/RewardsPage'
import VolunteerBciPage from './pages/volunteer/BciPage'

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  isAuthenticated: boolean
  userType: string | null
  requiredType: string
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

function AppRoutes() {
  const { isAuthenticated, userType } = useAuth()

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/bci" element={<VolunteerBciPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${userType}/dashboard`} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${userType}/dashboard`} replace />
            ) : (
              <RegisterPage />
            )
          } 
        />
      </Route>

      {/* NGO routes */}
      <Route 
        element={
          <ProtectedRoute 
            isAuthenticated={isAuthenticated} 
            userType={userType} 
            requiredType="ngo"
          >
            <NgoLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/ngo/dashboard" element={<NgoDashboardPage />} />
        <Route path="/ngo/events" element={<NgoEventsPage />} />
        <Route path="/ngo/events/create" element={<NgoCreateEventPage />} />
        <Route path="/ngo/events/:id" element={<NgoEventDetailsPage />} />
        <Route path="/ngo/reports" element={<NgoReportsPage />} />
        <Route path="/ngo/bci" element={<NgoBciPage />} />
        <Route path="/ngo/settings" element={<NgoSettingsPage />} />
      </Route>

      {/* Volunteer routes */}
      <Route 
        element={
          <ProtectedRoute 
            isAuthenticated={isAuthenticated} 
            userType={userType} 
            requiredType="volunteer"
          >
            <VolunteerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/volunteer/dashboard" element={<VolunteerDashboardPage />} />
        <Route path="/volunteer/events" element={<VolunteerEventsPage />} />
        <Route path="/volunteer/events/:id" element={<VolunteerEventDetailsPage />} />
        <Route path="/volunteer/profile" element={<VolunteerProfilePage />} />
        <Route path="/volunteer/rewards" element={<VolunteerRewardsPage />} />
        <Route path="/volunteer/bci" element={<VolunteerBciPage />} />
      </Route>
    </Routes>
  )
}

// Protected route component
function ProtectedRoute({ children, isAuthenticated, userType, requiredType }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (userType !== requiredType) {
    return <Navigate to={`/${userType}/dashboard`} replace />
  }

  return <>{children}</>
}

export default App