import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { supplyService } from '../services/api';
import '../styles/SupplyForm.css';

const SupplyForm = () => {
  const MIN_PRICE = 35; // Naira
  const MAX_PRICE = 80; // Naira

  const randomPrice = () => Math.floor(Math.random() * (MAX_PRICE - MIN_PRICE + 1)) + MIN_PRICE;

  const [formData, setFormData] = useState({
    bottleSize: '1L',
    quantity: 1,
    pricePerUnit: randomPrice(),
  });
  const [cashbackInfo, setCashbackInfo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const bottleSizes = ['30cl', '50cl', '60cl', '75cl', '1L', '1.5L'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'bottleSize' ? value : name === 'quantity' ? parseInt(value) || 0 : parseFloat(value) || 0
    });
  };

  // When bottle size changes, set a random price within the Naira range
  useEffect(() => {
    setFormData((prev) => ({ ...prev, pricePerUnit: randomPrice() }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.bottleSize]);

  // Auto-calculate and display cashback preview
  useEffect(() => {
    const totalAmount = formData.quantity * formData.pricePerUnit;
    // Note: Actual cashback amount will be determined by backend based on user.isReturning
    setCashbackInfo({
      totalAmount,
      estimatedCashback: totalAmount * 0.10 // Estimate if returning customer
    });
  }, [formData.quantity, formData.pricePerUnit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await supplyService.submitSupply(
        formData.bottleSize,
        formData.quantity,
        formData.pricePerUnit
      );

      const { supply, cashbackInfo: backendCashback } = response.data;

      setSuccess(`✅ Supply submitted successfully! Order ID: ${supply._id}`);
      
      // Display cashback info from backend
      if (backendCashback) {
        setCashbackInfo(backendCashback);
      }

      // Reset form
      setFormData({
        bottleSize: '1L',
        quantity: 1,
        pricePerUnit: 0,
      });

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit supply');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = formData.quantity * formData.pricePerUnit;

  return (
    <div className="supply-form-page">
      <div className="form-container">
        <Card className="supply-form-card">
          <h2>Supply Submission Form</h2>
          <p className="form-subtitle">Fill out the details below to submit your bottle supply</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="bottleSize">Bottle Size *</label>
              <select
                id="bottleSize"
                name="bottleSize"
                value={formData.bottleSize}
                onChange={handleChange}
                required
              >
                {bottleSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity (Units) *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pricePerUnit">Price Per Unit (₦) *</label>
              <input
                type="number"
                id="pricePerUnit"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                min={MIN_PRICE}
                max={MAX_PRICE}
                step="1"
                required
              />
              <small>Prices range: ₦{MIN_PRICE} - ₦{MAX_PRICE} (default generated)</small>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Supply'}
            </Button>
          </form>
        </Card>

        {/* Summary Card */}
        <Card className="summary-card">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Bottle Size:</span>
            <strong>{formData.bottleSize}</strong>
          </div>
          <div className="summary-row">
            <span>Quantity:</span>
            <strong>{formData.quantity} units</strong>
          </div>
          <div className="summary-row">
            <span>Price Per Unit:</span>
            <strong>₦{Number(formData.pricePerUnit).toFixed(0)}</strong>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Total Amount:</span>
            <strong>₦{Number(totalAmount).toFixed(0)}</strong>
          </div>

          {/* Cashback Section */}
          <div className="cashback-section">
            <h4>Cashback Info</h4>
            <p className="cashback-info">
              Estimated cashback at 10% (if returning customer): <strong>₦{Math.round(totalAmount * 0.1)}</strong>
            </p>
            <p className="cashback-note">
              • You'll earn 10% cashback on future orders once approved as a returning customer
              <br />
              • Cashback amount will be shown after submission
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SupplyForm;
