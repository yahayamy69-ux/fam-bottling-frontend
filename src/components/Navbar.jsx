import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (currentY > lastScrollY.current && currentY > 100) {
            setHidden(true);
            setIsMobileMenuOpen(false); // Close mobile menu on scroll
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
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          FAM
        </Link>

        {/* Desktop Menu */}
        <ul className="navbar-menu desktop-menu">
          {!user ? (
            <>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/meet-founders">Founders</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/login">Claim ₦10</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/scanner-game">Claim ₦10</Link></li>
              <li><Link to="/scanner-game">💰 Earn</Link></li>
              <li><Link to="/redeem">🎁 Redeem</Link></li>
              {user.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
              {user.role === 'admin' && <li><Link to="/admin/payments">💳 Payments</Link></li>}
              <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          {!user ? (
            <>
              <Link to="/" onClick={closeMobileMenu}>Home</Link>
              <Link to="/meet-founders" onClick={closeMobileMenu}>Founders</Link>
              <Link to="/contact" onClick={closeMobileMenu}>Contact</Link>
              <Link to="/login" onClick={closeMobileMenu}>Login</Link>
              <Link to="/login" onClick={closeMobileMenu}>Claim ₦10</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" onClick={closeMobileMenu}>Dashboard</Link>
              <Link to="/scanner-game" onClick={closeMobileMenu}>Claim ₦10</Link>
              <Link to="/scanner-game" onClick={closeMobileMenu}>💰 Earn</Link>
              <Link to="/redeem" onClick={closeMobileMenu}>🎁 Redeem</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={closeMobileMenu}>Admin</Link>}
              {user.role === 'admin' && <Link to="/admin/payments" onClick={closeMobileMenu}>💳 Payments</Link>}
              <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="logout-btn">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
