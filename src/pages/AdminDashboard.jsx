import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { adminService } from '../services/api';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateModal, setUpdateModal] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('pending');
  const [updateNotes, setUpdateNotes] = useState('');

  useEffect(() => {
    fetchAllSupplies();
  }, []);

  const fetchAllSupplies = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllSupplies();
      setSupplies(response.data.supplies);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load supplies');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (supplyId) => {
    try {
      await adminService.updateSupplyStatus(supplyId, updateStatus, updateNotes);
      setUpdateModal(null);
      setUpdateNotes('');
      fetchAllSupplies();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleToggleReturning = async (userId) => {
    try {
      await adminService.toggleReturningCustomer(userId);
      fetchAllSupplies();
    } catch (err) {
      alert(err.response?.data?.message || 'Toggle failed');
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

  if (loading) {
    return <div className="loading-container">Loading admin panel...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      {error && <div className="error-message">{error}</div>}

      <Card className="admin-stats">
        <h3>Platform Overview</h3>
        <div className="stats-grid">
          <div className="stat">
            <p className="stat-label">Total Supplies</p>
            <p className="stat-number">{supplies.length}</p>
          </div>
          <div className="stat">
            <p className="stat-label">Pending Approval</p>
            <p className="stat-number">{supplies.filter(s => s.status === 'pending').length}</p>
          </div>
          <div className="stat">
            <p className="stat-label">Approved</p>
            <p className="stat-number">{supplies.filter(s => s.status === 'approved').length}</p>
          </div>
          <div className="stat">
            <p className="stat-label">Total Revenue</p>
            <p className="stat-number">${supplies.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <Card className="supplies-list">
        <h3>All Supplies</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Email</th>
                <th>Bottle Size</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Cashback</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((supply) => (
                <tr key={supply._id}>
                  <td>{supply.userId.name}</td>
                  <td>{supply.userId.email}</td>
                  <td>{supply.bottleSize}</td>
                  <td>{supply.quantity}</td>
                  <td>${supply.totalAmount.toFixed(2)}</td>
                  <td className="cashback">${supply.cashback.toFixed(2)}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(supply.status) }}
                    >
                      {supply.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setUpdateModal(supply._id);
                        setUpdateStatus(supply.status);
                        setUpdateNotes(supply.notes);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn toggle-btn"
                      onClick={() => handleToggleReturning(supply.userId._id)}
                      title="Toggle returning customer status"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Update Modal */}
      {updateModal && (
        <div className="modal-overlay" onClick={() => setUpdateModal(null)}>
          <Card className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Update Supply Status</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Status</label>
                <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Add any notes here..."
                />
              </div>
              <div className="modal-buttons">
                <Button
                  onClick={() => handleUpdateStatus(updateModal)}
                  variant="primary"
                >
                  Update
                </Button>
                <Button
                  onClick={() => setUpdateModal(null)}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
