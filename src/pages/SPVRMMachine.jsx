import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SPVRMMachine.css';

const SPVRMMachine = () => {
  const [qrCode, setQrCode] = useState(null);
  const [sessionCode, setSessionCode] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pollInterval, setPollInterval] = useState(null);
  const navigate = useNavigate();

  const generateQRCode = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/qr/generate-login', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrImage);
        setSessionCode(data.sessionCode);
        // Start polling for authentication
        startPolling(data.sessionCode);
      } else {
        setError(data.message || 'Failed to generate QR code');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (code) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/qr/status/${code}`);
        const data = await response.json();

        if (data.status === 'authenticated' && data.token) {
          // User authenticated
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          clearInterval(interval);
          // Navigate to bottle scan page
          setTimeout(() => navigate('/bottle-scan'), 1000);
        } else if (data.status === 'expired') {
          clearInterval(interval);
          setError('QR code expired. Please try again.');
          resetQRCode();
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1000); // Poll every second

    setPollInterval(interval);
  };

  const resetQRCode = () => {
    setQrCode(null);
    setSessionCode(null);
    setUser(null);
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  };

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        navigate('/bottle-scan');
      }
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [navigate, pollInterval]);

  return (
    <div className="spvrm-machine">
      <div className="spvrm-container">
        <header className="spvrm-header">
          <h1>🍾 FAM Bottling</h1>
          <p>SPVRM Bottle Collection Station</p>
        </header>

        <div className="spvrm-content">
          {!qrCode ? (
            <div className="spvrm-welcome">
              <h2>Welcome to FAM Bottling</h2>
              <p>Scan your bottles and earn cashback rewards</p>

              {error && (
                <div className="spvrm-error">
                  <p>{error}</p>
                </div>
              )}

              <button
                className="spvrm-btn-large"
                onClick={generateQRCode}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Generating QR Code...
                  </>
                ) : (
                  <>
                    📱 Scan from Mobile Device
                  </>
                )}
              </button>

              <div className="spvrm-info">
                <h3>How to Use:</h3>
                <ol>
                  <li>Press "Scan from Mobile Device" button</li>
                  <li>Scan QR code using your mobile device camera</li>
                  <li>Confirm authentication on your phone</li>
                  <li>Start scanning bottles on this machine</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="spvrm-qr-display">
              <h2>Scan This QR Code</h2>
              <p>Using your mobile device camera</p>

              <div className="spvrm-qr-box">
                <img src={qrCode} alt="QR Code for authentication" />
              </div>

              <p className="spvrm-timer">
                ⏱️ Code expires in 10 minutes
              </p>

              <p className="spvrm-waiting">
                ⏳ Waiting for mobile authentication...
              </p>

              <button
                className="spvrm-btn-secondary"
                onClick={resetQRCode}
              >
                ✕ Cancel
              </button>
            </div>
          )}
        </div>

        <footer className="spvrm-footer">
          <p>For assistance, visit fam-bottling.com or call support</p>
        </footer>
      </div>
    </div>
  );
};

export default SPVRMMachine;
