import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import '../styles/AdminPayments.css';

const AdminPayments = ({ user }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  const fetchAllAccounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${window.location.origin}/api/bank-account/admin/all-accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data = await response.json();
      setAccounts(data.data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaymentProcessed = async (account) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setProcessingId(account.bankAccountId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${window.location.origin}/api/bank-account/admin/mark-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bankAccountId: account.bankAccountId,
          amountPaid: parseFloat(paymentAmount)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark payment');
      }

      // Update the account in the list
      setAccounts(prev => prev.map(acc => 
        acc.bankAccountId === account.bankAccountId 
          ? { ...acc, isVerified: true }
          : acc
      ));

      setSelectedAccount(null);
      setPaymentAmount('');
      setError('');
      
      // Show success
      setTimeout(() => {
        setError('');
      }, 0);
    } catch (err) {
      setError('❌ Error: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading payment accounts...</div>;
  }

  return (
    <div className="admin-payments-page">
      <div className="admin-header">
        <h1>💰 Payments Management</h1>
        <nav className="admin-nav">
          <a href="/admin" className="admin-link">Supplies</a>
          <a href="/admin/payments" className="admin-link active">💰 Payments</a>
        </nav>
      </div>

      {error && (
        <div className="error-card">
          <p>{error}</p>
          <button 
            onClick={() => setError('')}
            className="close-error"
          >
            ✕
          </button>
        </div>
      )}

      <Card className="summary-card">
        <div className="summary-grid">
          <div className="summary-item">
            <h3>Total Users</h3>
            <p className="summary-value">{accounts.length}</p>
          </div>
          <div className="summary-item">
            <h3>Pending Payments</h3>
            <p className="summary-value">{accounts.filter(a => !a.isVerified).length}</p>
          </div>
          <div className="summary-item">
            <h3>Total Cashback Owed</h3>
            <p className="summary-value">
              ₦{accounts.reduce((sum, a) => sum + a.totalCashback, 0).toFixed(0)}
            </p>
          </div>
          <div className="summary-item">
            <h3>Completed Payments</h3>
            <p className="summary-value">{accounts.filter(a => a.isVerified).length}</p>
          </div>
        </div>
      </Card>

      <Card className="accounts-card">
        <h3>User Bank Accounts</h3>
        
        {accounts.length === 0 ? (
          <div className="empty-state">
            <p>No bank accounts submitted yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Account Holder</th>
                  <th>Bank Name</th>
                  <th>Account Number</th>
                  <th>Total Cashback</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr 
                    key={account.bankAccountId}
                    className={account.isVerified ? 'verified-row' : 'pending-row'}
                  >
                    <td>{account.userName}</td>
                    <td>{account.userEmail}</td>
                    <td>{account.accountHolderName}</td>
                    <td>{account.bankName}</td>
                    <td className="account-number">
                      {account.accountNumber.slice(-4).padStart(account.accountNumber.length, '*')}
                    </td>
                    <td className="cashback">₦{account.totalCashback.toFixed(0)}</td>
                    <td>
                      <span className={`status-badge ${account.isVerified ? 'paid' : 'pending'}`}>
                        {account.isVerified ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </td>
                    <td>
                      {!account.isVerified ? (
                        <button
                          className="action-btn"
                          onClick={() => {
                            setSelectedAccount(account);
                            setPaymentAmount(account.totalCashback.toString());
                          }}
                        >
                          Pay
                        </button>
                      ) : (
                        <span className="completed">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment Modal */}
      {selectedAccount && (
        <div className="payment-modal-overlay" onClick={() => setSelectedAccount(null)}>
          <Card className="payment-modal" onClick={e => e.stopPropagation()}>
            <h2>Process Payment</h2>
            
            <div className="payment-details">
              <div className="detail-row">
                <span className="label">User:</span>
                <span className="value">{selectedAccount.userName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Account Holder:</span>
                <span className="value">{selectedAccount.accountHolderName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Bank:</span>
                <span className="value">{selectedAccount.bankName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Account Number:</span>
                <span className="value account-number">
                  {selectedAccount.accountNumber.slice(-4).padStart(selectedAccount.accountNumber.length, '*')}
                </span>
              </div>
              <div className="detail-row highlight">
                <span className="label">Amount to Pay:</span>
                <span className="value amount">₦{parseFloat(paymentAmount).toFixed(0)}</span>
              </div>
            </div>

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedAccount(null);
                  setPaymentAmount('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleMarkPaymentProcessed(selectedAccount)}
                disabled={processingId === selectedAccount.bankAccountId}
              >
                {processingId === selectedAccount.bankAccountId ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
