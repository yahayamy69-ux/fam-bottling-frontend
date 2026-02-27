import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import QRScanner from '../components/QRScanner';
import { authService } from '../services/api';
import '../styles/QRLoginPage.css';

const QRLoginPage = ({ setUser }) => {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get('session');
  const [showScanner, setShowScanner] = useState(!sessionCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      navigate('/dashboard');
    }
  }, [setUser, navigate]);

  // If session code is provided via QR link, authenticate
  useEffect(() => {
    if (sessionCode && !showScanner) {
      authenticateWithSession(sessionCode);
    }
  }, [sessionCode, showScanner]);

  const authenticateWithSession = async (code) => {
    setLoading(true);
    setError('');
    try {
      // First, verify user is logged in on mobile (check token)
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first on your mobile device');
        setShowScanner(false);
        return;
      }

      // Call backend to authenticate with QR code
      const response = await fetch('/api/qr/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionCode: code })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('✓ Authentication successful! The machine will now log you in.');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (scannedCode) => {
    // Extract session code from QR URL if needed
    let code = scannedCode;
    if (scannedCode.includes('session=')) {
      code = scannedCode.split('session=')[1];
    }
    await authenticateWithSession(code);
  };

  if (showScanner) {
    return (
      <QRScanner
        title="Scan QR Code from SPVRM Machine"
        onScan={handleQRScan}
        onError={(err) => setError(err)}
        allowClose={true}
        onClose={() => navigate('/login')}
      />
    );
  }

  return (
    <div className="qr-login-page">
      <Card className="qr-login-card">
        <div className="qr-login-content">
          <h2>Mobile Authentication</h2>
          <p className="qr-description">
            Scanning QR code from SPVRM machine to authenticate on the device
          </p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Authenticating...</p>
            </div>
          )}

          {!loading && !success && (
            <div className="qr-login-actions">
              <button
                className="btn-scan-qr"
                onClick={() => setShowScanner(true)}
              >
                🔍 Scan QR Code
              </button>
              <p className="divider">OR</p>
              <a href="/login" className="btn-manual-login">
                Sign In with Email
              </a>
            </div>
          )}
        </div>
      </Card>

      <div className="qr-info-section">
        <div className="info-card">
          <h3>How It Works</h3>
          <ol>
            <li>Stand at the SPVRM machine</li>
            <li>Display the QR code on your mobile device</li>
            <li>The machine will authenticate you</li>
            <li>Start scanning bottles or visit dashboard</li>
          </ol>
        </div>

        <div className="info-card">
          <h3>Requirements</h3>
          <ul>
            <li>Mobile device with camera</li>
            <li>Already logged in on mobile app</li>
            <li>Active internet connection</li>
            <li>QR code from SPVRM machine</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRLoginPage;
