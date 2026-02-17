import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [bottleCount, setBottleCount] = useState({
    bottle1: 0,
    bottle2: 0,
    bottle3: 0
  });
  const [showCounter, setShowCounter] = useState(false);

  const handleBottleClick = (bottleId) => {
    setShowCounter(true);
    setBottleCount(prev => ({
      ...prev,
      [bottleId]: prev[bottleId] + 1
    }));
  };

  const resetCount = () => {
    setBottleCount({ bottle1: 0, bottle2: 0, bottle3: 0 });
    setShowCounter(false);
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">FAM Bottling Co</h1>
          <p className="hero-tagline">Premium PET Bottle Solutions</p>
          <p className="hero-description">
            Your trusted partner for sustainable PET bottle supply and buy-back management with exclusive cashback rewards
          </p>
          <Link to="/supply">
            <Button variant="primary">Supply Bottles</Button>
          </Link>
        </div>
        <div className="hero-image">
          <div className="bottle-display">
            <div 
              className="bottle bottle-1 clickable" 
              onClick={() => handleBottleClick('bottle1')}
              title="Click to count bottles"
            ></div>
            <div 
              className="bottle bottle-2 clickable" 
              onClick={() => handleBottleClick('bottle2')}
              title="Click to count bottles"
            ></div>
            <div 
              className="bottle bottle-3 clickable" 
              onClick={() => handleBottleClick('bottle3')}
              title="Click to count bottles"
            ></div>
          </div>
        </div>

        {showCounter && (
          <div className="bottle-counter-modal">
            <Card className="counter-card">
              <h3>Bottle Counter</h3>
              <div className="counter-items">
                <div className="counter-item">
                  <span>Bottle Type 1:</span>
                  <span className="count">{bottleCount.bottle1}</span>
                </div>
                <div className="counter-item">
                  <span>Bottle Type 2:</span>
                  <span className="count">{bottleCount.bottle2}</span>
                </div>
                <div className="counter-item">
                  <span>Bottle Type 3:</span>
                  <span className="count">{bottleCount.bottle3}</span>
                </div>
              </div>
              <div className="counter-total">
                <span>Total:</span>
                <span className="total-count">
                  {bottleCount.bottle1 + bottleCount.bottle2 + bottleCount.bottle3}
                </span>
              </div>
              <button className="reset-btn" onClick={resetCount}>
                Reset Counter
              </button>
            </Card>
          </div>
        )}
      </section>

      {/* Problem Statement Section */}
      <section className="problem-statement">
        <div className="problem-container">
          <Card className="problem-card">
            <h2>The Challenge: Plastic Pollution</h2>
            <p className="problem-intro">
              Every year, over 300 million tons of plastic waste is generated globally, with only 9% being recycled.
              Single-use plastic bottles have become a critical environmental threat to our planet.
            </p>
            
            <div className="problem-grid">
              <div className="problem-item">
                <h3>Environmental Impact</h3>
                <p>
                  Over 5 trillion plastic bags are used annually, with most ending up in landfills and oceans.
                  Plastic bottles take 450 years to decompose, poisoning ecosystems and harming wildlife.
                </p>
              </div>

              <div className="problem-item">
                <h3>Ocean Pollution</h3>
                <p>
                  Approximately 8 million tons of plastic enter our oceans every year, creating massive garbage patches
                  and endangering marine life. We must act now to protect our seas.
                </p>
              </div>

              <div className="problem-item">
                <h3>Health Concerns</h3>
                <p>
                  Microplastics have been found in human bloodstreams and organs. Plastic pollution directly impacts
                  our health and that of future generations.
                </p>
              </div>

              <div className="problem-item">
                <h3>Our Solution</h3>
                <p>
                  FAM Bottling Co's recycling and buy-back program incentivizes plastic bottle recovery, reduces waste,
                  and protects our environment while rewarding our partners with exclusive cashback benefits.
                </p>
              </div>
            </div>

            <p className="problem-commitment">
              Together, we can create a sustainable future. Every bottle counts. Join FAM Bottling Co in our mission
              to reduce plastic pollution and protect our planet for generations to come.
            </p>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose FAM Bottling Co</h2>
        <div className="features-grid">
          <Card className="feature-card">
            <h3>Cashback Rewards</h3>
            <p>Earn 10% cashback as a returning customer on every supply</p>
          </Card>

          <Card className="feature-card">
            <h3>Sustainable</h3>
            <p>Premium quality PET bottles for all your bottling needs</p>
          </Card>

          <Card className="feature-card">
            <h3>Fast Processing</h3>
            <p>Quick approval and payment for your supplies</p>
          </Card>

          <Card className="feature-card">
            <h3>Secure Platform</h3>
            <p>Your data is protected with enterprise-grade security</p>
          </Card>
        </div>
      </section>

      {/* Bottle Sizes Section */}
      <section className="bottle-sizes">
        <h2>Available Bottle Sizes</h2>
        <div className="sizes-grid">
          {['30cl', '50cl', '60cl', '1L'].map((size) => (
            <div key={size} className="size-card">
              <p>{size}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Yahaya Inspiration Section */}
      <section className="inspiration-section">
        <div className="inspiration-container">
          <div className="inspiration-image">
            <img src="/images/3.jpeg" alt="Engr Yahaya Muhammad" />
          </div>
          <div className="inspiration-content">
            <h2>Our Vision</h2>
            <h3>Engr Yahaya Muhammad - Co-Founder & Technical Lead</h3>
            <p className="inspiration-quote">
              "The future of sustainability doesn't rest on the shoulders of corporations alone. 
              It takes committed individuals and innovative solutions to create real change. 
              When I saw the massive waste of plastic bottles being discarded daily, I knew we had to act. 
              FAM Bottling Co was born from a simple belief: that every bottle collected is a step 
              towards a cleaner planet, and every supplier rewarded is a partner in progress."
            </p>
            <p className="inspiration-desc">
              At FAM Bottling Co, we're not just recycling bottles—we're building a movement. 
              We believe that business and environmental responsibility go hand in hand. 
              By offering fair prices and sustainable practices, we're proving that doing good 
              and doing well aren't mutually exclusive.
            </p>
            <Link to="/meet-founders">
              <Button variant="secondary">Meet All Founders</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join our growing network of suppliers and start earning rewards today</p>
        <div className="cta-buttons">
          <Link to="/register">
            <Button variant="primary">Register Now</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary">Already a Member? Login</Button>
          </Link>
        </div>
      </section>

      {/* Copyright Footer */}
      <footer className="copyright-footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} FAM Bottling Co. All rights reserved.</p>
          <p>Dedicated to sustainable PET bottle solutions and environmental protection.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
