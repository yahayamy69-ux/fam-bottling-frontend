import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { supplyService } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = ({ user }) => {
  const [supplies, setSupplies] = useState([]);
  const [summary, setSummary] = useState({
    totalSupplies: 0,
    totalAmount: 0,
    totalCashback: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSupplies();
  }, []);

  const fetchSupplies = async () => {
    try {
      setLoading(true);
      const response = await supplyService.getUserSupplies();
      const { supplies: suppliesData, summary: summaryData } = response.data;

      setSupplies(suppliesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load supplies');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      paid: '#3b82f6',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const filteredSupplies = filter === 'all' 
    ? supplies 
    : supplies.filter(s => s.status === filter);

  if (loading) {
    return <div className="loading-container">Loading your dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <h1>Your Dashboard</h1>

      {/* User Info */}
      <Card className="user-info-card">
        <div className="user-greeting">
          <h2>Welcome back, {user.name}!</h2>
          <p className="returning-badge">
            {user.isReturning ? 'Returning Customer' : 'New Customer'}
          </p>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <h3>Total Supplies</h3>
          <p className="stat-value">{summary.totalSupplies}</p>
        </Card>

        <Card className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">${summary.totalAmount.toFixed(2)}</p>
        </Card>

        <Card className="stat-card">
          <h3>Total Cashback</h3>
          <p className="stat-value">${summary.totalCashback.toFixed(2)}</p>
        </Card>

        <Card className="stat-card">
          <h3>Reward Status</h3>
          <p className="stat-value">{user.isReturning ? '10%' : '0%'}</p>
        </Card>
      </div>

      {/* Transactions History */}
      <Card className="transactions-card">
        <div className="transactions-header">
          <h3>Transaction History</h3>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
            <button
              className={`filter-btn ${filter === 'paid' ? 'active' : ''}`}
              onClick={() => setFilter('paid')}
            >
              Paid
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {filteredSupplies.length === 0 ? (
          <div className="empty-state">
            <p>No supplies yet. Start by <a href="/supply">submitting a supply</a>!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bottle Size</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Cashback</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSupplies.map((supply) => (
                  <tr key={supply._id}>
                    <td>{new Date(supply.createdAt).toLocaleDateString()}</td>
                    <td>{supply.bottleSize}</td>
                    <td>{supply.quantity}</td>
                    <td>${supply.totalAmount.toFixed(2)}</td>
                    <td className="cashback-cell">${supply.cashback.toFixed(2)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(supply.status) }}
                      >
                        {supply.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Action Card */}
      <Card className="action-card">
        <h3>Ready to supply more bottles?</h3>
        <a href="/supply">
          <Button variant="primary">Submit New Supply</Button>
        </a>
      </Card>
    </div>
  );
};

export default Dashboard;
