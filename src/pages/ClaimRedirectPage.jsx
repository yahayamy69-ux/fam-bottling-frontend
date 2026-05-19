import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ClaimRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Error: No token provided. Please scan a valid QR code.');
      return;
    }

    const apiUrl = `${import.meta.env.VITE_API_URL || 'https://fam-bottling-backend-theta.vercel.app'}/api/claim/add10`;
    console.log('Claiming with token:', token, 'API URL:', apiUrl);
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Claim response:', data);
      setMessage(data.success ? '✓ ₦10 added to your balance!' : (data.message || 'Claim failed.'));
    })
    .catch(err => {
      console.error('Claim error:', err);
      setMessage(`Error: ${err.message}`);
    });
  }, [searchParams]);

  return (
    <div style={{ textAlign: 'center', marginTop: 80, fontSize: 24 }}>
      {message}
    </div>
  );
};

export default ClaimRedirectPage;
