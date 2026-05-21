import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import '../styles/BankAccountForm.css';

const BankAccountForm = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
    accountType: 'savings'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedAccount, setSavedAccount] = useState(null);

  useEffect(() => {
    fetchBankAccount();
  }, []);

  const fetchBankAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${window.location.origin}/api/bank-account/my-account`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedAccount(data.data);
        setFormData({
          accountHolderName: data.data.accountHolderName,
          accountNumber: data.data.accountNumber,
          bankName: data.data.bankName,
          bankCode: data.data.bankCode || '',
          accountType: data.data.accountType
        });
      }
    } catch (err) {
      console.error('Error fetching bank account:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.accountHolderName || !formData.accountNumber || !formData.bankName) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${window.location.origin}/api/bank-account/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess('✅ Bank account ' + (savedAccount ? 'updated' : 'added') + ' successfully!');
      setSavedAccount(data.data);
      setIsExpanded(false);
      
      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bank-account-form-card">
      <div className="bank-account-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <h3>💳 Bank Account Details</h3>
          <p className="header-subtitle">Add your bank account to receive payments</p>
        </div>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {savedAccount && !isExpanded && (
        <div className="saved-account-preview">
          <div className="preview-item">
            <span className="preview-label">Account Holder:</span>
            <span className="preview-value">{savedAccount.accountHolderName}</span>
          </div>
          <div className="preview-item">
            <span className="preview-label">Bank:</span>
            <span className="preview-value">{savedAccount.bankName}</span>
          </div>
          <button 
            className="edit-btn"
            onClick={() => setIsExpanded(true)}
          >
            ✏️ Edit
          </button>
        </div>
      )}

      {isExpanded && (
        <form onSubmit={handleSubmit} className="bank-account-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label>Account Holder Name *</label>
            <input
              type="text"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Bank Name *</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g., First Bank, GTBank"
                required
              />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
              >
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="checking">Checking</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Account Number *</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Your account number"
                required
              />
            </div>
            <div className="form-group">
              <label>Bank Code (Optional)</label>
              <input
                type="text"
                name="bankCode"
                value={formData.bankCode}
                onChange={handleChange}
                placeholder="e.g., 011"
              />
            </div>
          </div>

          <div className="form-actions">
            <Button 
              type="submit" 
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (savedAccount ? 'Update Account' : 'Add Account')}
            </Button>
            {savedAccount && (
              <Button 
                type="button"
                variant="secondary"
                onClick={() => setIsExpanded(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
    </Card>
  );
};

export default BankAccountForm;
