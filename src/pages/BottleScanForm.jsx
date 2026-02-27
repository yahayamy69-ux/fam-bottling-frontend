import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import QRScanner from '../components/QRScanner';
import { supplyService } from '../services/api';
import '../styles/BottleScanForm.css';

const BottleScanForm = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState({
    barcode: '',
    bottleSize: '1L',
    quantity: 1,
    pricePerUnit: 50,
  });
  const [cashbackInfo, setCashbackInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  const bottleSizes = ['30cl', '50cl', '60cl', '1L'];

  useEffect(() => {
    calculateCashback();
  }, [scannedData.quantity, scannedData.pricePerUnit]);

  const calculateCashback = () => {
    const totalAmount = scannedData.quantity * scannedData.pricePerUnit;
    setCashbackInfo({
      totalAmount,
      estimatedCashback: totalAmount * 0.10
    });
  };

  const handleQRScan = (scannedCode) => {
    // Parse barcode from QR code (format: BARCODE|SIZE|PRICE expected)
    // For simple barcodes, just get the code
    const parts = scannedCode.split('|');
    
    setScannedData((prev) => ({
      ...prev,
      barcode: parts[0] || scannedCode,
      bottleSize: parts[1] || '1L',
      pricePerUnit: parts[2] ? parseFloat(parts[2]) : 50
    }));

    setShowScanner(false);
    setError('');
    setSuccess('✓ Barcode scanned successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleManualInput = (e) => {
    const { name, value } = e.target;
    setScannedData({
      ...scannedData,
      [name]: name === 'bottleSize' ? value : name === 'quantity' ? parseInt(value) || 1 : parseFloat(value) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!scannedData.barcode) {
        setError('Please scan a barcode or enter barcode manually');
        setLoading(false);
        return;
      }

      // Use the bottle scan endpoint instead of supply
      const response = await fetch('/api/bottle-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(scannedData)
      });

      const data = await response.json();

      if (response.ok) {
        const { bottleScan, cashbackInfo: backendCashback } = data;

        setSuccess(`✅ Bottle scanned! Order ID: ${bottleScan._id}`);

        if (backendCashback) {
          setCashbackInfo(backendCashback);
        }

        // Add to scan history
        setScanHistory([bottleScan, ...scanHistory]);

        // Reset form
        setScannedData({
          barcode: '',
          bottleSize: '1L',
          quantity: 1,
          pricePerUnit: 50,
        });

        // Auto-reset success message
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to submit bottle scan');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit bottle scan');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = scannedData.quantity * scannedData.pricePerUnit;

  return (
    <div className="bottle-scan-page">
      {showScanner && (
        <QRScanner
          title="Scan Bottle Barcode"
          onScan={handleQRScan}
          onError={(err) => setError(err)}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="scan-form-container">
        <Card className="bottle-scan-card">
          <h2>🔍 Bottle Barcode Scanner</h2>
          <p className="form-subtitle">Scan or manually enter bottle details</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="bottle-scan-form">
            {/* Barcode Input */}
            <div className="form-group barcode-group">
              <label>Barcode</label>
              <div className="barcode-input-group">
                <input
                  type="text"
                  name="barcode"
                  value={scannedData.barcode}
                  onChange={handleManualInput}
                  placeholder="Scan or type barcode"
                  className="barcode-input"
                  required
                />
                <button
                  type="button"
                  className="btn-scan-barcode"
                  onClick={() => setShowScanner(true)}
                  disabled={loading}
                >
                  📱 SCAN
                </button>
              </div>
            </div>

            {/* Bottle Size */}
            <div className="form-group">
              <label>Bottle Size</label>
              <select
                name="bottleSize"
                value={scannedData.bottleSize}
                onChange={handleManualInput}
                required
              >
                {bottleSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={scannedData.quantity}
                onChange={handleManualInput}
                min="1"
                required
              />
            </div>

            {/* Price Per Unit */}
            <div className="form-group">
              <label>Price per Unit (₦)</label>
              <input
                type="number"
                name="pricePerUnit"
                value={scannedData.pricePerUnit}
                onChange={handleManualInput}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            {/* Summary */}
            <div className="summary-section">
              <div className="summary-row">
                <span>Total Amount:</span>
                <span className="total-amount">₦{totalAmount.toFixed(2)}</span>
              </div>
              {cashbackInfo && (
                <div className="summary-row">
                  <span>Est. Cashback (10%):</span>
                  <span className="cashback-amount">
                    ₦{cashbackInfo.estimatedCashback.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !scannedData.barcode}
              className="btn-submit-scan"
            >
              {loading ? '⏳ Submitting...' : '✓ Submit Scan'}
            </Button>
          </form>
        </Card>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card className="scan-history-card">
            <h3>📋 Recent Scans ({scanHistory.length})</h3>
            <div className="scan-history-list">
              {scanHistory.map((scan, idx) => (
                <div key={scan._id} className="scan-history-item">
                  <span className="scan-number">#{idx + 1}</span>
                  <div className="scan-details">
                    <p className="scan-barcode">{scan.barcode}</p>
                    <p className="scan-info">
                      {scan.quantity}x {scan.bottleSize} @ ₦{scan.pricePerUnit.toFixed(2)}
                    </p>
                  </div>
                  <div className="scan-status-badge" style={{ 
                    background: scan.status === 'pending' ? '#f59e0b' : '#10b981'
                  }}>
                    {scan.status}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BottleScanForm;
