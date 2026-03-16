import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import '../styles/LandingPage.css';

const LandingPage = () => {
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

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <h2>Our Impact</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Bottles Recycled</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500kg</div>
              <div className="stat-label">Plastic Waste Reduced</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">₦250,000</div>
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
              <div className="testimonial-author">- Sarah Johnson, Regular Supplier</div>
            </Card>
            <Card className="testimonial-card">
              <p>"The QR scanning feature is innovative and convenient. Great initiative for sustainable living."</p>
              <div className="testimonial-author">- Michael Ade, Tech Enthusiast</div>
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
