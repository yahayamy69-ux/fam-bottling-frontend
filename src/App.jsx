import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SupplyForm from './pages/SupplyForm';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import MeetFounders from './pages/MeetFounders';
import ContactUs from './pages/ContactUs';

// Components
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/meet-founders" element={<MeetFounders />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage setUser={setUser} />} />

        {/* Protected Routes */}
        <Route path="/supply" element={user ? <SupplyForm /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
