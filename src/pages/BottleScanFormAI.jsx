import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import QRScanner from '../components/QRScanner';
import MLScanner from '../components/MLScanner';
import '../styles/BottleScanFormAI.css';

const BottleScanFormAI = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [showMLScanner, setShowMLScanner] = useState(false);
  const [scannedData, setScannedData] = useState({
    barcode: '',
    bottleSize: '1L',
    quantity: 1,
    pricePerUnit: 50,
  });
  const [mlAnalysis, setMLAnalysis] = useState(null);
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

  const handleMLDetection = (mlResults) => {
    // Auto-fill form with ML results
    setScannedData((prev) => ({
      ...prev,
      bottleSize: mlResults.bottleSize || prev.bottleSize,
      quantity: prev.quantity
    }));
    
    setMLAnalysis(mlResults);
    setShowMLScanner(false);
    
    // Show confidence info
    const sizeText = `${mlResults.bottleSize} detected`;
    const conditionText = `Condition: ${mlResults.condition}`;
    setSuccess(`✓ ${sizeText} | ${conditionText}`);
    setTimeout(() => setSuccess(''), 4000);
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

      const submitData = {
        ...scannedData,
        mlAnalysisData: mlAnalysis // Include ML data if available
      };

      const response = await fetch('/api/bottle-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (response.ok) {
        const { bottleScan, cashbackInfo: backendCashback } = data;
        
        setSuccess(`✅ Bottle scanned! Order ID: ${bottleScan._id}`);

        if (backendCashback) {
          setCashbackInfo(backendCashback);
        }

        setScanHistory([bottleScan, ...scanHistory]);

        // Reset form and ML analysis
        setScannedData({
          barcode: '',
          bottleSize: '1L',
          quantity: 1,
          pricePerUnit: 50,
        });
        setMLAnalysis(null);

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
    <div className="bottle-scan-page-ai">
      {showScanner && (
        <QRScanner
          title="Scan Bottle Barcode"
          onScan={handleQRScan}
          onError={(err) => setError(err)}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showMLScanner && (
        <MLScanner
          onDetectionComplete={handleMLDetection}
          onClose={() => setShowMLScanner(false)}
        />
      )}

      <div className="scan-form-container-ai">
        <Card className="bottle-scan-card-ai">
          <h2>🤖 AI-Powered Bottle Scanner</h2>
          <p className="form-subtitle">Automatic detection with manual override</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* AI Analysis Results Display */}
          {mlAnalysis && (
            <div className="ml-analysis-display">
              <div className="ml-result-mini">
                <span className="ml-label">Detected Size:</span>
                <span className="ml-value">{mlAnalysis.bottleSize}</span>
                <span className="ml-confidence">({(mlAnalysis.sizeConfidence * 100).toFixed(0)}%)</span>
              </div>
              <div className="ml-result-mini">
                <span className="ml-label">Condition:</span>
                <span className="ml-value">{mlAnalysis.condition}</span>
                <span className="ml-confidence">({mlAnalysis.conditionScore.toFixed(0)}%)</span>
              </div>
              <div className="ml-result-mini">
                <span className="ml-label">Quality Score:</span>
                <span className="ml-value">{mlAnalysis.qualityScore.toFixed(0)}%</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bottle-scan-form-ai">
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

            {/* AI Scanner Button */}
            <div className="form-group ai-scanner-group">
              <button
                type="button"
                className="btn-ai-scanner"
                onClick={() => setShowMLScanner(true)}
                disabled={loading}
              >
                🤖 AI Detect Size & Condition
              </button>
              {mlAnalysis && <span className="ml-badge">ML Analysis Complete ✓</span>}
            </div>

            {/* Bottle Size */}
            <div className="form-group">
              <label>Bottle Size {mlAnalysis && '(AI Detected)'}</label>
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
              {mlAnalysis && (
                <p className="field-note">Original: {mlAnalysis.bottleSize}</p>
              )}
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
              {mlAnalysis && (
                <div className="summary-row ml-quality">
                  <span>ML Quality Score:</span>
                  <span className="quality-badge">{mlAnalysis.qualityScore.toFixed(0)}%</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !scannedData.barcode}
              className="btn-submit-scan-ai"
            >
              {loading ? '⏳ Submitting...' : '✓ Submit Scan'}
            </Button>
          </form>
        </Card>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card className="scan-history-card-ai">
            <h3>📋 Recent Scans ({scanHistory.length})</h3>
            <div className="scan-history-list">
              {scanHistory.map((scan, idx) => (
                <div key={scan._id} className="scan-history-item-ai">
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

export default BottleScanFormAI;
