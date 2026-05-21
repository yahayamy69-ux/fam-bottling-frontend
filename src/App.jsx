import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SupplyForm from './pages/SupplyForm';
import BottleScanForm from './pages/BottleScanForm';
import BottleScanFormAI from './pages/BottleScanFormAI';
import QRLoginPage from './pages/QRLoginPage';
import RechargeQRPage from './pages/RechargeQRPage';
import MachineLoginPage from './pages/MachineLoginPage';
import SPVRMMachine from './pages/SPVRMMachine';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminPayments from './pages/AdminPayments';
import MeetFounders from './pages/MeetFounders';
import ContactUs from './pages/ContactUs';
import BarcodeScannerGame from './pages/BarcodeScannerGame';
import ClaimRedirectPage from './pages/ClaimRedirectPage';
import RedeemPage from './pages/RedeemPage';

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

  // Listen for localStorage changes from other tabs or pages
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error('Failed to parse updated user:', e);
        }
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom claim success event (from same tab)
    window.addEventListener('claimSuccess', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('claimSuccess', handleStorageChange);
    };
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
        {/* SPVRM Machine Kiosk Mode */}
        <Route path="/machine" element={<SPVRMMachine />} />

        {/* Public Routes */}
        <Route path="/" element={<LandingPage user={user} setUser={setUser} />} />
        <Route path="/meet-founders" element={<MeetFounders />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage setUser={setUser} />} />
        <Route path="/qr-login" element={<QRLoginPage setUser={setUser} />} />
        <Route path="/qr-auth" element={<QRLoginPage setUser={setUser} />} />
        <Route path="/recharge/qr" element={<RechargeQRPage />} />
        <Route path="/claim-now" element={<ClaimRedirectPage />} />
        <Route path="/machine-login" element={<MachineLoginPage setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage setUser={setUser} />} />

        {/* Protected Routes */}
        <Route path="/supply" element={user ? <SupplyForm /> : <Navigate to="/login" />} />
        <Route path="/bottle-scan" element={user ? <BottleScanForm /> : <Navigate to="/login" />} />
        <Route path="/bottle-scan-ai" element={user ? <BottleScanFormAI /> : <Navigate to="/login" />} />
        <Route path="/qr-scan" element={user ? <BottleScanForm /> : <Navigate to="/login" />} />
        <Route path="/scanner-game" element={user ? <BarcodeScannerGame user={user} /> : <Navigate to="/login" />} />
        <Route path="/redeem" element={user ? <RedeemPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
        <Route path="/admin/payments" element={user && user.role === 'admin' ? <AdminPayments user={user} /> : <Navigate to="/dashboard" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
