import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../styles/QRScanner.css';

const QRScanner = ({ onScan, onError, title = 'Scan QR Code or Barcode', allowClose = true, onClose }) => {
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    if (!scanning) return;

    const html5QrcodeScan = new Html5QrcodeScanner(
      'qr-scanner-container',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
        showZoomedQrImage: true,
      },
      false
    );

    html5QrcodeScannerRef.current = html5QrcodeScan;

    const onScanSuccess = (decodedText) => {
      console.log('QR/Barcode detected:', decodedText);
      html5QrcodeScan.pause();
      setScanning(false);
      onScan(decodedText);
    };

    const onScanFailure = (error) => {
      // Low-level debugging. Ignore common scanning errors but log others
      if (error && typeof error === 'string' && 
          !error.includes('QR code parse error') && 
          !error.includes('No QR code found') &&
          !error.includes('No MultiFormat Readers')) {
        console.warn('Scanner error:', error);
        onError?.(error);
      }
    };

    // Add error handling for render.
    // html5-qrcode render may return a promise or undefined depending on package version.
    try {
      const renderResult = html5QrcodeScan.render(onScanSuccess, onScanFailure);
      if (renderResult && typeof renderResult.catch === 'function') {
        renderResult.catch((err) => {
          console.error('Failed to render scanner:', err);
          setScanning(false);
          onError?.(`Failed to start camera: ${err.message}`);
        });
      }
    } catch (err) {
      console.error('Failed to render scanner:', err);
      setScanning(false);
      onError?.(`Failed to start camera: ${err.message}`);
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch((err) => {
          console.error('Scanner cleanup error:', err);
        });
      }
    };
  }, [scanning, onScan, onError]);

  const handleClose = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
    }
    setScanning(false);
    onClose?.();
  };

  const handleRescan = () => {
    setScanning(true);
  };

  return (
    <div className="qr-scanner-modal">
      <div className="qr-scanner-container">
        <div className="qr-scanner-header">
          <h3>{title}</h3>
          {allowClose && (
            <button className="qr-scanner-close" onClick={handleClose}>
              ✕
            </button>
          )}
        </div>

        {scanning ? (
          <div className="qr-scanner-content">
            <div id="qr-scanner-container" className="scanner-feed"></div>
            <p className="scanner-hint">Point camera at QR Code or Barcode</p>
          </div>
        ) : (
          <div className="qr-scanner-content scanner-paused">
            <p className="scan-complete">✓ Scan Successful!</p>
            <button className="btn-rescan" onClick={handleRescan}>
              Scan Again
            </button>
            {allowClose && (
              <button className="btn-close-modal" onClick={handleClose}>
                Close
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
