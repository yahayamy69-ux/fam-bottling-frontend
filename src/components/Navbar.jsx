import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          FAM Bottling Co
        </Link>
        <ul className="navbar-menu">
          {!user ? (
            <>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/meet-founders">Meet Founders</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/meet-founders">Meet Founders</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/supply">Supply Now</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              {user.role === 'admin' && (
                <li><Link to="/admin">Admin Panel</Link></li>
              )}
              <li>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
