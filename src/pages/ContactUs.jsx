import React from 'react';
import Card from '../components/Card';
import '../styles/ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to submit');

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Contact submit failed', err);
      alert('Failed to submit message. Please try again later.');
    }
  };

  return (
    <div className="contact-us-page">
      <div className="contact-header">
        <h1>Get In Touch</h1>
        <p>We'd love to hear from you. Send us a message!</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <Card className="info-card">
            <h2>Contact Information</h2>
            
            <div className="info-item">
              <h3>Phone</h3>
              <a href="tel:08166394988" className="contact-link">
                08166394988
              </a>
            </div>

            <div className="info-item">
              <h3>Email</h3>
              <a href="mailto:timelessbyemjay@gmail.com" className="contact-link">
                timelessbyemjay@gmail.com
              </a>
            </div>

            <div className="info-item">
              <h3>Business Hours</h3>
              <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
              <p>Saturday: 10:00 AM - 3:00 PM</p>
              <p>Sunday: Closed</p>
            </div>

            <div className="info-item">
              <h3>Quick Response</h3>
              <p>We typically respond to all inquiries within 24 hours.</p>
            </div>
          </Card>
        </div>

        <div className="contact-form-section">
          <Card className="form-card">
            <h2>Send us a Message</h2>
            
            {submitted && (
              <div className="success-message">
                ✓ Thank you! Your message has been sent successfully.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button type="submit" className="submit-btn">
                Send Message
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
