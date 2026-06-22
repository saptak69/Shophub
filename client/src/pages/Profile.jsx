import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching profile orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, navigate]);

  const getStatusColor = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', text: '#d97706' },
      confirmed: { bg: '#e0e7ff', text: '#4338ca' },
      shipped: { bg: '#f3e8ff', text: '#7e22ce' },
      delivered: { bg: '#dcfce3', text: '#15803d' }
    };
    return styles[status] || { bg: '#f1f5f9', text: '#64748b' };
  };

  if (!user) return null;

  return (
    <div className="profile-page container animate-fade-in" style={{ padding: '3rem 0' }}>
      <h1 className="section-title">OPERATIVE TERMINAL</h1>

      <div className="profile-content">
        {/* Profile info card */}
        <div className="profile-info">
          <h2>
            OPERATOR DETAILS
          </h2>
          <div className="info-row">
            <span className="label">NAME</span>
            <span style={{ fontWeight: 700 }}>{user.name || 'Not provided'}</span>
          </div>
          <div className="info-row">
            <span className="label">EMAIL</span>
            <span style={{ fontWeight: 700 }}>{user.email}</span>
          </div>
          <div className="info-row">
            <span className="label">ACCESS ROLE</span>
            <span style={{ fontWeight: 700, textTransform: 'uppercase', color: user.role === 'admin' ? 'var(--accent)' : 'var(--text-main)' }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Order history */}
        <div className="orders-history">
          <h2>
            TRANSACTION LOGS
          </h2>
          
          {loading ? (
            <div className="empty-state">
              <p>LOADING TRANSACTIONS...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <p>No transaction history found.</p>
            </div>
          ) : (
            <div className="table-shell" style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>TOTAL PRICE</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusColor = getStatusColor(order.status);
                    return (
                      <tr key={order._id || order.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {(order._id || order.id).substring(0, 8)}...
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                          ₹{Number(order.totalPrice).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span 
                            style={{ 
                              border: `1px solid ${statusColor.text}`,
                              color: statusColor.text, 
                              padding: '0.25rem 0.75rem', 
                              fontSize: '0.85rem', 
                              fontWeight: 700, 
                              textTransform: 'uppercase',
                              display: 'inline-block'
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.95rem' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
