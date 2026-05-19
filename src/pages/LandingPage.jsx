import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import Card from '../components/Card';
import Button from '../components/Button';
import { scannerGameService } from '../services/api';
import '../styles/LandingPage.css';

const LandingPage = ({ user, setUser }) => {
  const [animatedStats, setAnimatedStats] = useState({
    bottles: 0,
    waste: 0,
    revenue: 0
  });
  const [currentCode, setCurrentCode] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [qrWarning, setQrWarning] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [scanMessageType, setScanMessageType] = useState('');
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    if (user) {
      generateNewCode();
    }
  }, [user]);

  // Generate QR code whenever currentCode changes
  const getPublicBaseUrl = () => {
    const origin = window.location.origin;

    // Localhost is not publicly reachable from another device.
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return null;
    }

    return origin;
  };

  useEffect(() => {
    if (currentCode?.code) {
      const generateQR = async () => {
        try {
          const baseUrl = getPublicBaseUrl();

          if (!baseUrl) {
            setQrWarning('QR unavailable in local development');
            setQrCodeImage(null);
            return;
          }

          setQrWarning('');

          const qrData = `${baseUrl}/recharge/qr?sessionId=${encodeURIComponent(currentCode.sessionId)}&token=${encodeURIComponent(currentCode.rechargeToken)}`;
          console.log('Generated recharge QR URL:', qrData);
          const qrImage = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 200,
            margin: 2,
            color: { dark: '#1e7145', light: '#ffffff' }
          });
          setQrCodeImage(qrImage);
        } catch (error) {
          console.error('QR code generation failed:', error);
          setQrWarning('Unable to generate QR code at this time.');
        }
      };
      generateQR();
    }
  }, [currentCode]);

  const updateUserBalance = (newBalance) => {
    if (!user || !setUser) return;
    const updatedUser = { ...user, totalCashback: newBalance };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const generateNewCode = async () => {
    if (!user) return;

    try {
      setQrWarning('');
      setScanLoading(true);
      setScanMessage('');
      const response = await scannerGameService.generateCode();
      const codeData = response.data.data || response.data;
      setCurrentCode(codeData);
      setCurrentSessionId(codeData.sessionId);
      setManualInput('');
      setScanMessage('Scan or enter the 4-digit code below to earn ₦10.');
      setScanMessageType('info');
    } catch (error) {
      setScanMessage(error.response?.data?.message || 'Unable to generate code.');
      setScanMessageType('error');
    } finally {
      setScanLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setScanMessage('Please login to scan and earn ₦10.');
      setScanMessageType('error');
      return;
    }
    if (manualInput.trim().length !== 4) {
      setScanMessage('Enter a valid 4-digit code.');
      setScanMessageType('error');
      return;
    }

    try {
      setScanLoading(true);
      setScanMessage('Validating your code...');
      setScanMessageType('info');
      const response = await scannerGameService.processScan(manualInput.trim(), currentSessionId);
      if (response.data.success) {
        const result = response.data.data || response.data;
        const newBalance = result.newBalance ?? user.totalCashback + 10;
        updateUserBalance(newBalance);
        setScanMessage(response.data.message || 'Success! ₦10 added to your balance.');
        setScanMessageType('success');
        generateNewCode();
      }
    } catch (error) {
      setScanMessage(error.response?.data?.message || 'Code validation failed.');
      setScanMessageType('error');
    } finally {
      setScanLoading(false);
    }
  };

  useEffect(() => {
    const targets = {
      bottles: 10000,
      waste: 500,
      revenue: 4000000
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setAnimatedStats({
        bottles: Math.floor(targets.bottles * progress),
        waste: Math.floor(targets.waste * progress),
        revenue: Math.floor(targets.revenue * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(targets); // Ensure exact final values
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Use your PET bottles as currency with us</h1>
          <p className="hero-subtitle">Earn cashback, reduce waste, protect the environment</p>
          <Link to="/supply">
            <Button variant="primary">Start Recycling</Button>
          </Link>
        </div>
      </section>

      {/* Schemes Section */}
      <section className="schemes">
        <div className="container">
          <h2>Earn rewards with our recycling schemes</h2>
          <div className="schemes-grid">
            <Card className="scheme-card">
              <div className="scheme-icon">🏠</div>
              <h3>Supply Bottles</h3>
              <p>Drop off your PET bottles at our collection points and earn instant cashback rewards.</p>
              <Link to="/supply">
                <Button variant="secondary">Get Started</Button>
              </Link>
            </Card>

            <Card className="scheme-card">
              <div className="scheme-icon">📱</div>
              <h3>Scan & Earn</h3>
              <p>Use our QR scanner to verify and recycle bottles directly through your device.</p>
              <Link to="/bottle-scan">
                <Button variant="secondary">Scan Now</Button>
              </Link>
            </Card>

            <Card className="scheme-card">
              <div className="scheme-icon">🏢</div>
              <h3>Business Partnership</h3>
              <p>Join our corporate recycling program and turn your waste into sustainable business benefits.</p>
              <Link to="/contact">
                <Button variant="secondary">Contact Us</Button>
              </Link>
            </Card>

            <Card className="scheme-card">
              <div className="scheme-icon">🔄</div>
              <h3>Buy-Back Program</h3>
              <p>Trade in your used bottles for premium rewards and contribute to a cleaner planet.</p>
              <Link to="/supply">
                <Button variant="secondary">Learn More</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Scan & Earn Section */}
      <section className="scan-earn">
        <div className="container">
          <h2>Scan & Earn ₦10 Instantly</h2>
          <p className="scan-earn-subtitle">Use your homepage to enter a 4-digit code and collect cashback instantly.</p>

          {user ? (
            <div className="scan-earn-grid">
              <div className="scan-earn-card">
                <h3>Scan to Recharge</h3>
                <div className="qr-recharge-panel">
                  {/* QR Code Display */}
                  {qrCodeImage ? (
                    <div className="qr-code-container">
                      <img src={qrCodeImage} alt="Recharge QR Code" className="qr-code-image" />
                      <p className="qr-instruction">Scan with your device to add ₦10</p>
                    </div>
                  ) : qrWarning ? (
                    <div className="qr-warning">{qrWarning}</div>
                  ) : (
                    <div className="qr-placeholder">Generating QR code...</div>
                  )}

                  {/* Divider */}
                  <div className="code-divider">
                    <span>OR</span>
                  </div>

                  {/* Manual Code Entry */}
                  <div className="manual-code-section">
                    <p className="code-label">Enter 4-digit code:</p>
                    <form onSubmit={handleManualSubmit} className="scan-form">
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                        maxLength={4}
                        placeholder="0000"
                        className="scan-input"
                      />
                      <button type="submit" className="btn btn-primary" disabled={scanLoading || manualInput.length !== 4}>
                        {scanLoading ? 'Validating...' : 'Submit'}
                      </button>
                    </form>
                  </div>

                  <button
                    className="btn btn-secondary btn-new-code"
                    onClick={generateNewCode}
                    disabled={scanLoading}
                  >
                    🔄 New Code
                  </button>
                </div>
              </div>

              <div className="scan-earn-card">
                <h3>Your Balance</h3>
                <div className="balance-display">₦{user.totalCashback ?? 0}</div>
                <p className="balance-note">Scan the QR code or enter the 4-digit code to add ₦10 to your balance.</p>
              </div>
            </div>
          ) : (
            <div className="scan-earn-guest">
              <p>Login to scan QR codes and earn instant cashback.</p>
              <div className="scan-earn-guest-actions">
                <Link to="/login" className="btn btn-primary">Login</Link>
                <Link to="/register" className="btn btn-secondary">Register</Link>
              </div>
            </div>
          )}

          {scanMessage && (
            <div className={`scan-message scan-message-${scanMessageType}`}>
              {scanMessage}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <h2>Our Impact</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{animatedStats.bottles.toLocaleString()}+</div>
              <div className="stat-label">Bottles Recycled</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{animatedStats.waste}kg</div>
              <div className="stat-label">Plastic Waste Reduced</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">₦{animatedStats.revenue.toLocaleString()}</div>
              <div className="stat-label">Cashback Paid</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Collect</h3>
              <p>Gather your clean PET bottles</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Scan/Supply</h3>
              <p>Use our app or visit collection points</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Earn</h3>
              <p>Receive instant cashback rewards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <h2>What Our Partners Say</h2>
          <div className="testimonials-grid">
            <Card className="testimonial-card">
              <p>"FAM Bottling Co has made recycling rewarding and easy. I've earned significant cashback while helping the environment."</p>
              <div className="testimonial-author">- Adebayo Johnson, Regular Supplier</div>
            </Card>
            <Card className="testimonial-card">
              <p>"The QR scanning feature is innovative and convenient. Great initiative for sustainable living."</p>
              <div className="testimonial-author">- Fatima Adeyemi, Tech Enthusiast</div>
            </Card>
            <Card className="testimonial-card">
              <p>"As a business owner, partnering with FAM has helped us reduce waste and improve our sustainability image."</p>
              <div className="testimonial-author">- Chukwuma Okoye, Business Partner</div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Join the Movement</h2>
          <p>Start recycling today and earn rewards while protecting our planet</p>
          <div className="cta-buttons">
            <Link to="/register">
              <Button variant="primary">Sign Up Now</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Login</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
