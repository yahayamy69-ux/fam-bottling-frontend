import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (currentY > lastScrollY.current && currentY > 100) {
            setHidden(true);
          } else {
            setHidden(false);
          }
          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${hidden ? 'navbar--hidden' : ''}`}>
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
              <li><Link to="/qr-login">🔍 QR Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/meet-founders">Meet Founders</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/supply">Supply Now</Link></li>
              <li><Link to="/bottle-scan">🔍 Scan Bottles</Link></li>
              <li><Link to="/bottle-scan-ai">🤖 AI Scan</Link></li>
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
