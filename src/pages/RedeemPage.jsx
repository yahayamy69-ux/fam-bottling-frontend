import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { redeemService } from '../services/api';
import '../styles/RedeemPage.css';

const RedeemPage = ({ user }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    // Convert to uppercase and only allow alphanumeric characters
    const value = e.target.value.toUpperCase().replace(/[^R0-9]/g, '');
    // Limit to R + 6 digits max
    if (value.startsWith('R')) {
      setCode(value.slice(0, 7)); // R + 6 digits
    } else {
      setCode(value.slice(0, 7));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResult(null);
    setLoading(true);

    try {
      if (!code.trim()) {
        throw new Error('Please enter a reward code');
      }

      const response = await redeemService.redeemCode(code);

      if (response.data.success) {
        const { pointsEarned, previousTotal, newTotal } = response.data.data;

        setSuccess('✅ Reward code redeemed successfully!');
        setResult({
          pointsEarned,
          previousTotal,
          newTotal
        });

        // Update user in localStorage
        const updatedUser = {
          ...user,
          totalCashback: newTotal
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Dispatch event for Dashboard to listen
        window.dispatchEvent(new Event('claimSuccess'));

        // Reset form
        setCode('');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to redeem code';
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="redeem-page">
      <div className="form-container">
        <Card className="redeem-form-card">
          <h2>Redeem Reward Code</h2>
          <p className="form-subtitle">Enter your reward code from the machine to earn points</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="code">Reward Code</label>
              <input
                type="text"
                id="code"
                placeholder="e.g., R3050 or R100000"
                value={code}
                onChange={handleInputChange}
                maxLength="7"
                disabled={loading}
                autoComplete="off"
              />
              <p className="code-hint">Format: R followed by 4-6 digits (examples: R3050, R100000)</p>
            </div>

            <Button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn-primary"
            >
              {loading ? 'Processing...' : 'Redeem Code'}
            </Button>
          </form>
        </Card>

        {/* Results Card */}
        {result && (
          <Card className="result-card">
            <h3>Redemption Details</h3>

            <div className="result-row">
              <span className="label">Points Earned:</span>
              <span className="value points-earned">+{result.pointsEarned} pts</span>
            </div>

            <div className="result-row">
              <span className="label">Previous Balance:</span>
              <span className="value">{result.previousTotal} pts</span>
            </div>

            <div className="result-row highlight">
              <span className="label">New Total Balance:</span>
              <span className="value new-total">{result.newTotal} pts</span>
            </div>

            <div className="info-box">
              <p>Your cashback balance has been updated. You can use these points for future transactions.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RedeemPage;
