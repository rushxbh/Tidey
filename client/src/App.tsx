import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VolunteerDashboard from './pages/volunteer/Dashboard';
import VolunteerEvents from './pages/volunteer/EventsPage';
import VolunteerProfile from './pages/volunteer/ProfilePage';
import VolunteerRewards from './pages/volunteer/RewardsPage';
import NGODashboard from './pages/ngo/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<VolunteerDashboard />} />
            <Route path="volunteer/dashboard" element={<VolunteerDashboard />} />
            <Route path="volunteer/events" element={<VolunteerEvents />} />
            <Route path="volunteer/profile" element={<VolunteerProfile />} />
            <Route path="volunteer/rewards" element={<VolunteerRewards />} />
            <Route path="ngo/dashboard" element={<NGODashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider> 
  );
}

export default App;