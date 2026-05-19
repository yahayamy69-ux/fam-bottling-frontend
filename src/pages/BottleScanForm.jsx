import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { supplyService } from '../services/api';
import '../styles/BottleScanForm.css';

const BottleScanForm = () => {
  const [isActive, setIsActive] = useState(false);
  const [bottleData, setBottleData] = useState({
    bottleSize: '1L',
    quantity: 0,
    pricePerUnit: 50,
  });
  const [cashbackInfo, setCashbackInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectionLog, setDetectionLog] = useState([]);
  const [sensorActive, setSensorActive] = useState(false);

  const bottleSizes = ['30cl', '50cl', '60cl', '1L'];

  useEffect(() => {
    calculateCashback();
  }, [bottleData.quantity, bottleData.pricePerUnit]);

  const calculateCashback = () => {
    const totalAmount = bottleData.quantity * bottleData.pricePerUnit;
    setCashbackInfo({
      totalAmount,
      estimatedCashback: totalAmount * 0.10
    });
  };

  // Simulate machine sensor detecting bottles
  const startSensorDetection = () => {
    setSensorActive(true);
    setDetectionLog([]);
    setBottleData({ ...bottleData, quantity: 0 });
    
    // Simulate bottles being detected (in real scenario, this would be API call to machine)
    let detectedCount = 0;
    const interval = setInterval(() => {
      if (detectedCount < 10) { // Demo: simulate detecting up to 10 bottles
        detectedCount++;
        setBottleData(prev => ({
          ...prev,
          quantity: detectedCount
        }));
        
        const timestamp = new Date().toLocaleTimeString();
        setDetectionLog(prev => [
          ...prev,
          `${timestamp} - Bottle #${detectedCount} detected (${bottleData.bottleSize})`
        ]);
      }
    }, 1500); // Detect a bottle every 1.5 seconds

    return () => clearInterval(interval);
  };

  const stopSensorDetection = () => {
    setSensorActive(false);
  };

  const handleManualInput = (e) => {
    const { name, value } = e.target;
    setBottleData({
      ...bottleData,
      [name]: name === 'bottleSize' ? value : name === 'quantity' ? parseInt(value) || 0 : parseFloat(value) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (bottleData.quantity <= 0) {
        setError('Please detect or enter at least 1 bottle');
        setLoading(false);
        return;
      }

      // Submit supply directly (not bottle-scan, just supply)
      const response = await supplyService.submitSupply(
        bottleData.bottleSize,
        bottleData.quantity,
        bottleData.pricePerUnit
      );

      if (response.status === 201 || response.status === 200) {
        setSuccess(`✅ Supply submitted! ${bottleData.quantity} bottles of ${bottleData.bottleSize}`);
        
        // Reset form
        setBottleData({
          bottleSize: '1L',
          quantity: 0,
          pricePerUnit: 50,
        });
        setDetectionLog([]);

        // Auto-reset success message
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data?.message || 'Failed to submit supply');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit supply');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = bottleData.quantity * bottleData.pricePerUnit;

  return (
    <div className="bottle-scan-page">
      <div className="scan-form-container">
        <Card className="bottle-scan-card">
          <h2>🤖 Automatic Machine Sensor Detection</h2>
          <p className="form-subtitle">Bottles are automatically detected as they pass through the machine</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="bottle-scan-form">
            
            {/* Sensor Status */}
            <div className="form-group sensor-status">
              <div className="status-indicator">
                <div className={`status-light ${sensorActive ? 'active' : ''}`}></div>
                <span className="status-text">
                  {sensorActive ? '🟢 Sensor Active - Detecting bottles...' : '🔴 Sensor Inactive'}
                </span>
              </div>
            </div>

            {/* Detection Controls */}
            <div className="form-group sensor-controls">
              {!sensorActive ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={startSensorDetection}
                  disabled={sensorActive}
                >
                  ▶️ Start Sensor Detection
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={stopSensorDetection}
                >
                  ⏹️ Stop Detection
                </button>
              )}
            </div>

            {/* Bottle Size */}
            <div className="form-group">
              <label>Bottle Size</label>
              <select
                name="bottleSize"
                value={bottleData.bottleSize}
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

            {/* Quantity Display */}
            <div className="form-group">
              <label>Bottles Detected</label>
              <div className="quantity-display">
                <span className="quantity-number">{bottleData.quantity}</span>
                <div className="quantity-controls">
                  <button
                    type="button"
                    onClick={() => setBottleData(prev => ({ ...prev, quantity: Math.max(0, prev.quantity - 1) }))}
                    className="btn-adjust"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => setBottleData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                    className="btn-adjust"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price Per Unit */}
            <div className="form-group">
              <label>Price per Unit (₦)</label>
              <input
                type="number"
                name="pricePerUnit"
                value={bottleData.pricePerUnit}
                onChange={handleManualInput}
                min="0"
                step="10"
                required
              />
            </div>

            {/* Cashback Info */}
            {cashbackInfo && (
              <div className="cashback-info">
                <div className="cashback-row">
                  <span>Total Amount:</span>
                  <strong>₦{cashbackInfo.totalAmount.toFixed(2)}</strong>
                </div>
                <div className="cashback-row highlight">
                  <span>Estimated Cashback (10%):</span>
                  <strong>₦{cashbackInfo.estimatedCashback.toFixed(2)}</strong>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-submit"
              disabled={loading || bottleData.quantity === 0}
            >
              {loading ? 'Submitting...' : `Submit ${bottleData.quantity} Bottles`}
            </button>
          </form>

          {/* Detection Log */}
          {detectionLog.length > 0 && (
            <div className="detection-log">
              <h3>📋 Detection Log</h3>
              <div className="log-entries">
                {detectionLog.map((entry, idx) => (
                  <div key={idx} className="log-entry">
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BottleScanForm;

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
