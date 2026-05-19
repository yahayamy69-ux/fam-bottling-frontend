import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import { qrService } from '../services/api';
import '../styles/QRLoginPage.css';

const QRLoginPage = ({ setUser }) => {
  const [searchParams] = useSearchParams();
  const rawSessionCode = searchParams.get('session');
  const sessionCode = rawSessionCode
    ? rawSessionCode.replace(/[\r\n]+/g, '').trim()
    : null;
  const [generatedQR, setGeneratedQR] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, [setUser]);

  useEffect(() => {
    if (!sessionCode) {
      fetchLoginQR();
    }
  }, [sessionCode]);

  useEffect(() => {
    if (sessionCode) {
      authenticateWithSession(sessionCode);
    }
  }, [sessionCode]);

  const fetchLoginQR = async () => {
    setQrError('');
    setQrLoading(true);
    try {
      const response = await qrService.generateLoginQR();
      setGeneratedQR(response.data);
    } catch (err) {
      setQrError(err.response?.data?.message || err.message || 'Unable to generate QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const authenticateWithSession = async (code) => {
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const response = await qrService.authenticateWithQR(code);
      if (response.data.success || response.status === 200) {
        setAuthSuccess('✓ Authentication successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setAuthError(response.data.message || 'Authentication failed');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'Failed to authenticate');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="qr-login-page">
      <Card className="qr-login-card">
        <div className="qr-login-content">
          <h2>{sessionCode ? 'Mobile Authentication' : 'SPVRM Machine Login'}</h2>
          <p className="qr-description">
            {sessionCode
              ? 'Processing mobile authentication for this machine login session.'
              : 'This page generates a QR code automatically for the SPVRM machine. Scan it with your mobile device to authenticate.'}
          </p>

          {sessionCode ? (
            <>
              {authError && <div className="error-message">{authError}</div>}
              {authSuccess && <div className="success-message">{authSuccess}</div>}

              {authLoading && (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Authenticating...</p>
                </div>
              )}
            </>
          ) : (
            <>
              {qrError && <div className="error-message">{qrError}</div>}
              {qrLoading && (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Generating QR Code...</p>
                </div>
              )}

              {!qrLoading && generatedQR && (
                <div className="qr-display-panel">
                  <div className="qr-image-container">
                    <img src={generatedQR.qrImage} alt="SPVRM machine login QR" className="qr-image" />
                  </div>
                  <div className="qr-details">
                    <p><strong>Session Code:</strong> {generatedQR.sessionCode}</p>
                    <p><strong>Login Code:</strong> {generatedQR.loginCode}</p>
                    <p><strong>Expires in:</strong> {generatedQR.expiresIn}s</p>
                  </div>
                  <button className="btn-primary" type="button" onClick={fetchLoginQR} disabled={qrLoading}>
                    Refresh QR
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      {!sessionCode && (
        <div className="qr-info-section">
          <div className="info-card">
            <h3>How It Works</h3>
            <ol>
              <li>Open this page on the SPVRM kiosk.</li>
              <li>Scan the displayed QR code with a mobile device.</li>
              <li>Mobile device authenticates the machine session.</li>
              <li>Machine logs in and your dashboard becomes available.</li>
            </ol>
          </div>

          <div className="info-card">
            <h3>Tip</h3>
            <ul>
              <li>Use the generated QR code within 10 minutes.</li>
              <li>Refresh the code if it expires or if the session fails.</li>
              <li>Keep your mobile device logged in.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRLoginPage;
