import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import { machineService } from '../services/api';
import '../styles/AuthPages.css';

const MachineLoginPage = ({ setUser }) => {
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Validating machine login...');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const machineId = searchParams.get('machine_id');
  const token = searchParams.get('token');

  useEffect(() => {
    const runMachineLogin = async () => {
      if (!machineId || !token) {
        setError('Invalid machine login link. Please scan a valid machine QR code.');
        setLoading(false);
        return;
      }

      try {
        const response = await machineService.startSession(machineId, token);
        const { status, sessionId, message } = response.data;

        if (status === 'active') {
          setStatusMessage('Machine login validated. Redirecting you to your dashboard...');
          localStorage.removeItem('pendingMachineSessionId');
          setTimeout(() => navigate('/dashboard'), 1200);
          return;
        }

        if (status === 'pending' && sessionId) {
          localStorage.setItem('pendingMachineSessionId', sessionId);
          setStatusMessage('Machine login is ready. Please sign in to complete access.');
          setTimeout(() => navigate('/login'), 1200);
          return;
        }

        setError(message || 'Machine login could not be started.');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Machine login validation failed');
      } finally {
        setLoading(false);
      }
    };

    runMachineLogin();
  }, [machineId, token, navigate]);

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <h2>Machine Login</h2>
        {loading && <p className="auth-description">{statusMessage}</p>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && <p className="auth-description">{statusMessage}</p>}
      </Card>
    </div>
  );
};

export default MachineLoginPage;
