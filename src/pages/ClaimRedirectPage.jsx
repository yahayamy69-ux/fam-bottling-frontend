import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ClaimRedirectPage = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing...');

  useEffect(() => {
    const token = searchParams.get('token');
    fetch(`${import.meta.env.VITE_API_URL || 'https://fam-bottling-backend-theta.vercel.app'}/api/claim/add10`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => setMessage(data.success ? '✓ ₦10 added to your balance!' : data.message))
    .catch(() => setMessage('Failed. Try again.'));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: 80, fontSize: 24 }}>
      {message}
    </div>
  );
};

export default ClaimRedirectPage;
