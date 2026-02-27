import React, { useRef, useState } from 'react';
import { mlService, canvasToBase64, interpretCondition, getSizeConfidenceLabel } from '../services/mlService';
import '../styles/MLScanner.css';

const MLScanner = ({ onDetectionComplete, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  // Initialize camera
  React.useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        setError('Camera access denied or not available');
        console.error('Camera error:', err);
      }
    };

    if (scanning) startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [scanning]);

  const captureAndAnalyze = async () => {
    try {
      setAnalyzing(true);
      setError('');

      if (!videoRef.current || !canvasRef.current) {
        setError('Camera not ready');
        return;
      }

      // Capture frame
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      // Convert to base64
      const imageBase64 = canvasToBase64(canvasRef.current);

      // Run ML analysis
      const response = await mlService.analyzeImage(imageBase64);

      if (response.data.success) {
        const analysisResults = response.data.results;

        // Extract useful data
        const bottleCount = analysisResults.detection?.bottle_count || 0;
        const condition = analysisResults.condition?.status || 'unknown';
        const conditionConfidence = analysisResults.condition?.confidence || 0;
        const estimatedSize = analysisResults.size_estimation?.estimated_size || 'unknown';
        const sizeConfidence = analysisResults.size_estimation?.confidence || 0;
        const qualityScore = analysisResults.overall_quality_score || 0;

        setResults({
          bottleCount,
          condition,
          conditionConfidence,
          estimatedSize,
          sizeConfidence,
          qualityScore,
          raw: analysisResults,
          imageBase64
        });

        setScanning(false);
      } else {
        setError('Analysis failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (results && onDetectionComplete) {
      onDetectionComplete({
        bottleSize: results.estimatedSize,
        condition: results.condition,
        conditionScore: results.conditionConfidence,
        sizeConfidence: results.sizeConfidence,
        qualityScore: results.qualityScore,
        mlData: results.raw
      });
      onClose?.();
    }
  };

  const handleRetake = () => {
    setResults(null);
    setScanning(true);
  };

  const conditionInfo = results ? interpretCondition(results.condition) : null;

  return (
    <div className="ml-scanner-modal">
      <div className="ml-scanner-container">
        {scanning ? (
          <>
            <div className="ml-scanner-header">
              <h3>AI Bottle Scanner 🤖</h3>
              <button className="ml-scanner-close" onClick={onClose}>✕</button>
            </div>

            <div className="ml-scanner-feed">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="ml-scanner-overlay">
                <div className="ml-scanner-frame"></div>
                <p className="ml-scanner-hint">Position bottle in frame</p>
              </div>
            </div>

            {error && <div className="ml-scanner-error">{error}</div>}

            <div className="ml-scanner-controls">
              <button
                className="ml-btn-capture"
                onClick={captureAndAnalyze}
                disabled={!cameraActive || analyzing}
              >
                {analyzing ? (
                  <>
                    <div className="spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  '📸 Capture & Analyze'
                )}
              </button>
            </div>
          </>
        ) : results ? (
          <>
            <div className="ml-results-header">
              <h3>✓ Analysis Complete</h3>
              <button className="ml-scanner-close" onClick={onClose}>✕</button>
            </div>

            <div className="ml-results-container">
              {/* Condition Card */}
              <div className="ml-result-card condition-card">
                <h4>Bottle Condition</h4>
                <div className="condition-display" style={{ borderLeft: `4px solid ${conditionInfo.color}` }}>
                  <span className="condition-emoji">{conditionInfo.emoji}</span>
                  <div className="condition-details">
                    <p className="condition-status">{conditionInfo.message}</p>
                    <p className="condition-confidence">Confidence: {results.conditionConfidence.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Size Estimation Card */}
              <div className="ml-result-card size-card">
                <h4>Estimated Size</h4>
                <div className="size-display">
                  <p className="size-value">{results.estimatedSize}</p>
                  <p className="size-confidence">
                    {getSizeConfidenceLabel(results.sizeConfidence)}
                  </p>
                </div>
              </div>

              {/* Quality Score Card */}
              <div className="ml-result-card quality-card">
                <h4>Overall Quality</h4>
                <div className="quality-bar">
                  <div
                    className="quality-fill"
                    style={{ width: `${results.qualityScore}%` }}
                  ></div>
                </div>
                <p className="quality-score">{results.qualityScore.toFixed(0)}%</p>
              </div>

              {/* Bottles Detected */}
              {results.bottleCount > 0 && (
                <div className="ml-result-card bottles-card">
                  <h4>Bottles Detected</h4>
                  <p className="bottle-count">{results.bottleCount}</p>
                </div>
              )}
            </div>

            <div className="ml-results-actions">
              <button className="ml-btn-retake" onClick={handleRetake}>
                🔄 Retake
              </button>
              <button className="ml-btn-confirm" onClick={handleConfirm}>
                ✓ Use These Details
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MLScanner;
