import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VolunteerDashboard from "./pages/volunteer/Dashboard";
import VolunteerEvents from "./pages/volunteer/EventsPage";
import VolunteerProfile from "./pages/volunteer/ProfilePage";
import VolunteerRewards from "./pages/volunteer/RewardsPage";
import VolunteerAchievements from "./pages/volunteer/AchievementsPage";
import VolunteerDonations from "./pages/volunteer/DonationsPage";
import NGODashboard from "./pages/ngo/Dashboard";
import NGOEvents from "./pages/ngo/EventsPage";
import NGOVolunteers from "./pages/ngo/VolunteersPage";
import NGOAnalytics from "./pages/ngo/AnalyticsPage";
import NGOBeachScanner from "./pages/ngo/BeachScannerPage";
import EditEventPage from "./pages/ngo/EditEventPage";
import AdminOperation from "./pages/ngo/admin-operation";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Volunteer Routes */}
          <Route
            path="/volunteer"
            element={<Layout requiredRole="volunteer" />}
          >
            <Route
              index
              element={<Navigate to="/volunteer/dashboard" replace />}
            />
            <Route path="dashboard" element={<VolunteerDashboard />} />
            <Route path="events" element={<VolunteerEvents />} />
            <Route path="profile" element={<VolunteerProfile />} />
            <Route path="rewards" element={<VolunteerRewards />} />
            <Route path="achievements" element={<VolunteerAchievements />} />
            <Route path="donations" element={<VolunteerDonations />} />
          </Route>

          {/* Protected NGO Routes */}
          <Route path="/ngo" element={<Layout requiredRole="ngo" />}>
            <Route index element={<Navigate to="/ngo/dashboard" replace />} />
            <Route path="dashboard" element={<NGODashboard />} />
            <Route path="events" element={<NGOEvents />} />
            <Route path="events/:id/edit" element={<EditEventPage />} />
            <Route path="volunteers" element={<NGOVolunteers />} />
            <Route path="analytics" element={<NGOAnalytics />} />
            <Route path="beach-scanner" element={<NGOBeachScanner />} />
            <Route path="admin-operation" element={<AdminOperation />} />
          </Route>

          {/* Legacy redirects for old URLs */}
          <Route
            path="/dashboard/volunteer/*"
            element={<Navigate to="/volunteer/dashboard" replace />}
          />
          <Route
            path="/dashboard/ngo/*"
            element={<Navigate to="/ngo/dashboard" replace />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
