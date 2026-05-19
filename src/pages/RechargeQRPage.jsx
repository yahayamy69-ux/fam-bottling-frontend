import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/QRLoginPage.css';

const RechargeQRPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Validating recharge QR code...');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    const token = searchParams.get('token');

    console.log('RechargeQRPage params:', { sessionId, token: token ? '***masked***' : null });

    if (!sessionId || !token) {
      setStatus('error');
      setMessage('Missing sessionId or token. This QR code cannot be processed.');
      return;
    }

    const validateRecharge = async () => {
      try {
        console.log('Validating recharge QR:', { sessionId, token: token ? '***masked***' : null });
        const response = await api.get(`/recharge/qr?sessionId=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`);
        console.log('Recharge QR response:', response.data);
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Recharge successful! ₦10 has been added to your account.');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Unable to process recharge QR code.');
        }
      } catch (error) {
        console.error('Recharge QR validation failed:', error.response?.data || error.message);
        setStatus('error');
        setMessage(error.response?.data?.message || error.message || 'Unable to process recharge QR code.');
      }
    };

    validateRecharge();
  }, [searchParams]);

  return (
    <div className="qr-login-page">
      <div className="qr-login-card">
        <div className="qr-login-content">
          <h2>Recharge QR Validation</h2>
          <p className="qr-description">This page validates the scanned recharge QR link and credits your account.</p>

          {status === 'loading' && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="success-message">
              <p>{message}</p>
              <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </div>
          )}

          {status === 'error' && (
            <div className="error-message">
              <p>{message}</p>
              <Link to="/" className="btn-secondary">Return Home</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RechargeQRPage;
