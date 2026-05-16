import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { scannerGameService } from '../services/api';
import '../styles/BarcodeScannerGame.css';

const BarcodeScannerGame = ({ user }) => {
  const [currentCode, setCurrentCode] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [userStats, setUserStats] = useState({ totalEarnings: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [scannedSuccessfully, setScannedSuccessfully] = useState(false);
  const html5QrcodeScannerRef = React.useRef(null);

  useEffect(() => {
    generateNewCode();
    fetchUserStats();
  }, []);

  // Generate new 4-digit code
  const generateNewCode = async () => {
    try {
      setLoading(true);
      console.log('🔄 Generating new code...');
      const response = await scannerGameService.generateCode();
      console.log('✅ Code generated:', response.data);
      
      // Handle both response.data.data and response.data structures
      const codeData = response.data.data || response.data;
      setCurrentCode(codeData);
      setScannedSuccessfully(false);
      setManualInput('');
      setMessage('');
    } catch (error) {
      console.error('❌ Failed to generate code:', error);
      setMessage(`Failed to generate code: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      console.log('📊 Fetching user stats...');
      const response = await scannerGameService.getUserStats();
      console.log('✅ User stats:', response.data);
      const statsData = response.data.data || response.data;
      setUserStats(statsData);
    } catch (error) {
      console.error('❌ Failed to fetch user stats:', error);
      setMessage(`Failed to load stats: ${error.message}`);
      setMessageType('error');
    }
  };

  // Process the scan
  const handleScanSuccess = async (scannedValue) => {
    try {
      setLoading(true);
      console.log('🔍 Processing scanned value:', scannedValue);
      const response = await scannerGameService.processScan(scannedValue);
      console.log('✅ Scan response:', response.data);
      
      if (response.data.success) {
        const scanData = response.data.data || response.data;
        setMessage(`✓ ${response.data.message}`);
        setMessageType('success');
        setScannedSuccessfully(true);
        setUserStats({ 
          totalEarnings: scanData.newBalance || scanData.totalEarnings || userStats.totalEarnings + 10 
        });
        
        // Auto-generate new code after 2 seconds
        setTimeout(() => {
          generateNewCode();
          setMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
      setMessage(error.response?.data?.message || error.message || 'Scan failed');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Start camera scanner
  const startScanner = async () => {
    if (scanning) return;

    console.log('📹 Starting camera scanner...');
    setScanning(true);
    
    // Clear previous scanner if exists
    if (html5QrcodeScannerRef.current) {
      try {
        await html5QrcodeScannerRef.current.clear();
      } catch (e) {
        console.warn('Warning clearing previous scanner:', e);
      }
    }

    const html5QrcodeScan = new Html5QrcodeScanner(
      'qr-scanner-container-game',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.777777,
        disableFlip: false,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        showZoomedQrImage: true,
        defaultZoomValueIfSupported: 1,
      },
      false
    );

    html5QrcodeScannerRef.current = html5QrcodeScan;

    const onScanSuccess = (decodedText) => {
      console.log('✅ Barcode detected:', decodedText);
      html5QrcodeScan.pause();
      setScanning(false);
      handleScanSuccess(decodedText);
    };

    const onScanFailure = (error) => {
      // Silently ignore common scanning errors
      if (error && typeof error === 'string' && 
          !error.includes('QR code parse error') && 
          !error.includes('No QR code found') &&
          !error.includes('No barcode') &&
          !error.includes('NotFoundException')) {
        console.warn('⚠️  Scanner warning:', error);
      }
    };

    try {
      console.log('🔧 Rendering scanner...');
      await html5QrcodeScan.render(onScanSuccess, onScanFailure);
      console.log('✅ Scanner rendered successfully');
      setMessage('📷 Camera ready - point at barcode');
      setMessageType('info');
    } catch (err) {
      console.error('❌ Failed to render scanner:', err);
      setScanning(false);
      const errorMsg = err.message || 'Unknown error';
      setMessage(`📷 Camera error: ${errorMsg}. Make sure you allow camera access.`);
      setMessageType('error');
    }
  };

  // Stop scanner
  const stopScanner = () => {
    console.log('🛑 Stopping camera scanner...');
    if (html5QrcodeScannerRef.current) {
      try {
        html5QrcodeScannerRef.current.clear();
        console.log('✅ Scanner stopped');
      } catch (err) {
        console.error('❌ Error stopping scanner:', err);
      }
    }
    setScanning(false);
    setMessage('');
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        try {
          html5QrcodeScannerRef.current.clear();
        } catch (e) {
          console.warn('Cleanup warning:', e);
        }
      }
    };
  }, []);

  // Handle manual code input
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScanSuccess(manualInput);
    }
  };

  return (
    <div className="barcode-scanner-game-page">
      <div className="scanner-game-content">
        <h1>💰 Barcode Scanner Game</h1>

        {/* Stats Card */}
        <div className="earnings-card">
          <h2>Your Earnings</h2>
          <div className="earnings-display">
            <span className="currency-symbol">₦</span>
            <span className="earnings-amount">{userStats.totalEarnings}</span>
          </div>
          <p className="earnings-label">Total Naira Earned</p>
        </div>

        {/* Instructions */}
        <div className="instructions-card">
          <h3>How to Play</h3>
          <ol>
            <li>Scan the barcode displayed below with your camera, or</li>
            <li>Manually enter the 4-digit code</li>
            <li>Earn <strong>₦10</strong> for each successful scan!</li>
          </ol>
        </div>

        {/* Display Code to Scan */}
        <div className="code-display-card">
          <p className="code-label">Scan this barcode or 4-digit code:</p>
          {currentCode ? (
            <div className="code-display">
              <div className="display-code">
                <p>{currentCode.displayCode || currentCode.code || 'Loading...'}</p>
              </div>
              <p className="code-hint">4-Digit Code</p>
            </div>
          ) : (
            <div className="code-display">
              <div className="display-code">
                <p>Loading...</p>
              </div>
              <p className="code-hint">Initializing...</p>
            </div>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`message-box message-${messageType}`}>
            {message}
          </div>
        )}

        {/* Scanner Section */}
        <div className="scanner-section">
          <h3>Option 1: Scan with Camera</h3>
          {!scanning ? (
            <button 
              className="btn btn-primary" 
              onClick={startScanner}
              disabled={loading}
            >
              📷 Start Camera Scanner
            </button>
          ) : (
            <div>
              <div id="qr-scanner-container-game"></div>
              <button 
                className="btn btn-secondary" 
                onClick={stopScanner}
              >
                Stop Scanner
              </button>
            </div>
          )}
        </div>

        {/* Manual Entry Section */}
        <div className="manual-entry-section">
          <h3>Option 2: Enter Code Manually</h3>
          <form onSubmit={handleManualSubmit} className="manual-input-form">
            <input
              type="text"
              placeholder="Enter 4-digit code"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.slice(0, 4))}
              maxLength="4"
              className="code-input"
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || manualInput.length !== 4}
            >
              Submit
            </button>
          </form>
        </div>

        {/* Generate New Code Button */}
        <div className="new-code-section">
          <button 
            className="btn btn-secondary"
            onClick={generateNewCode}
            disabled={loading}
          >
            🔄 Generate New Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerGame;
