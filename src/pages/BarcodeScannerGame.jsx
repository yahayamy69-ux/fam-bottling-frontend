import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { scannerGameService, claimService } from '../services/api';
import '../styles/BarcodeScannerGame.css';

// Simplified "Claim ₦10" component — two options: QR or 4-digit manual claim.
const BarcodeScannerGame = ({ user }) => {
  const [qrImage, setQrImage] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(user?.totalCashback || 0);

  useEffect(() => {
    if (user && typeof user.totalCashback === 'number') {
      setBalance(user.totalCashback || 0);
      return;
    }

    // Fallback: load cached user from localStorage (helps after navigation/hmr)
    try {
      const cached = localStorage.getItem('user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.totalCashback === 'number') {
          setBalance(parsed.totalCashback || 0);
          return;
        }
      }
    } catch (e) {
      // ignore
    }

    setBalance(0);
  }, [user]);

  // Generate QR code directly in frontend using token
  const generateQRCode = async () => {
    try {
      setQrLoading(true);
      setMessage('');
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Error: No authentication token found.');
        setQrLoading(false);
        return;
      }
      const qrUrl = `${window.location.origin}/claim-now?token=${token}`;
      console.log('Generated claim QR URL:', qrUrl);
      const img = await QRCode.toDataURL(qrUrl, { width: 220 });
      console.log('QR generated successfully:', img.substring(0, 50) + '...');
      setQrImage(img);
      setMessage('Scan this QR with your phone to claim ₦10.');
    } catch (err) {
      console.error('Failed to generate claim QR:', err);
      setMessage('Unable to generate QR at this time: ' + err.message);
    } finally {
      setQrLoading(false);
    }
  };

  // Manual claim: accept 4-digit code and redeem via ESP endpoint
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const code = manualInput.trim();
    if (code.length !== 4) {
      setMessage('Please enter a 4-digit code.');
      return;
    }

    try {
      setLoading(true);
      setMessage('Processing code...');
      
      // Call ESP redeem endpoint
      const token = localStorage.getItem('token');
      const resp = await fetch(`${window.location.origin}/api/esp/redeem-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.message || 'Failed to redeem code');
      }

      // Update localStorage immediately
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.totalCashback = (stored.totalCashback || 0) + 10;
      localStorage.setItem('user', JSON.stringify(stored));
      
      setBalance(stored.totalCashback);
      setMessage('✓ ₦10 added to your balance!');
      setManualInput('');
    } catch (err) {
      console.error('Code redemption failed:', err);
      setMessage(err.message || 'Unable to redeem code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="barcode-scanner-game-page">
      <div className="scanner-game-content">
        <h1>Claim ₦10</h1>

        <div className="earnings-card">
          <h2>Your Balance</h2>
          <div className="earnings-display">
            <span className="currency-symbol">₦</span>
            <span className="earnings-amount">{balance}</span>
          </div>
        </div>

        {message && <div className="message-box">{message}</div>}

        <div className="claim-options">
          <div className="claim-qr-section">
            <h3>Option 1 — QR Code</h3>
            <p className="manual-hint">Show this QR on your screen and scan with your phone.</p>
            <div className="qr-area">
              {qrImage ? (
                <img src={qrImage} alt="Claim QR" className="qr-image" />
              ) : (
                <div className="qr-placeholder">No QR generated</div>
              )}
            </div>
            <button className="btn btn-secondary" onClick={generateQRCode} disabled={qrLoading}>
              {qrLoading ? 'Generating...' : 'Generate QR'}
            </button>
          </div>

          <div className="claim-manual-section">
            <h3>Option 2 — 4-digit code</h3>
            <p className="manual-hint">Enter any 4 digits to claim ₦10 instantly.</p>
            <form onSubmit={handleManualSubmit} className="manual-input-form">
              <input
                type="text"
                placeholder="Enter 4 digits"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                className="code-input"
              />
              <button type="submit" className="btn btn-primary" disabled={loading || manualInput.length !== 4}>
                {loading ? 'Processing...' : 'Claim ₦10'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerGame;
