import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Admin = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'addProduct'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // New product form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Anime',
    image: ''
  });
  const [formStatus, setFormStatus] = useState({ success: '', error: '' });
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch admin orders
  const loadAdminOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminOrders();
    }
  }, [user, token]);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Update local state
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    } catch (err) {
      alert(`System error: ${err.message}`);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Permanently delete this order record?')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
      alert(`System error: ${err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setFormStatus({ success: '', error: '' });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'File upload failed');
      }

      setNewProduct(prev => ({
         ...prev,
         image: data.url
      }));
      setFormStatus({ success: 'Asset uploaded to pipeline successfully!', error: '' });
    } catch (err) {
      console.error('File upload error:', err);
      setFormStatus({ success: '', error: `Upload error: ${err.message}` });
    } finally {
      setUploadingImage(false);
    }
  };


  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ success: '', error: '' });

    const priceNum = parseFloat(newProduct.price);
    const stockNum = parseInt(newProduct.stock, 10);

    if (isNaN(priceNum) || priceNum <= 0 || isNaN(stockNum) || stockNum < 0) {
      setFormStatus({ success: '', error: 'Please enter valid price and stock levels.' });
      return;
    }

    setPublishing(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: priceNum,
          stock: stockNum
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to publish item.');
      }

      setFormStatus({ success: 'Item published to the catalog successfully!', error: '' });
      setNewProduct({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'Anime',
        image: ''
      });
    } catch (err) {
      setFormStatus({ success: '', error: err.message });
    } finally {
      setPublishing(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-page container animate-fade-in" style={{ padding: '3rem 0' }}>
      <h1 className="section-title">ADMIN CONTROL PANEL</h1>

      <div className="admin-layout">
        {/* Sidebar Nav */}
        <aside className="admin-sidebar">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          >
            FULFILLMENT LOGS
          </button>
          <button 
            onClick={() => setActiveTab('addProduct')}
            className={`btn ${activeTab === 'addProduct' ? 'btn-primary' : 'btn-secondary'}`}
          >
            RELEASE NEW DROP
          </button>
        </aside>

        {/* Content Panel */}
        <main className="admin-content-panel">
          {activeTab === 'orders' && (
            <div>
              <h2>
                CUSTOMER INVOICES
              </h2>

              {loadingOrders ? (
                <div className="empty-state">
                  <p>EXTRACTING DATABASE RECORDS...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <p>No active transactions found.</p>
                </div>
              ) : (
                <div className="table-shell" style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>TX ID</th>
                        <th>CUSTOMER</th>
                        <th>FULFILLMENT STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {order._id.substring(0, 8)}...
                          </td>
                          <td>
                            <span style={{ fontWeight: 700 }}>{order.userId?.name || order.userName || 'Guest User'}</span>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {order.userId?.email || 'N/A'}
                            </div>
                          </td>
                          <td>
                            <select 
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                              className="admin-inline-select"
                              style={{ 
                                padding: '0.45rem 0.7rem', 
                                border: '1px solid var(--border-color)', 
                                background: '#000',
                                color: '#fff',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}
                            >
                              <option value="pending">PENDING</option>
                              <option value="confirmed">CONFIRMED</option>
                              <option value="shipped">SHIPPED</option>
                              <option value="delivered">DELIVERED</option>
                            </select>
                          </td>
                          <td>
                            <button 
                              className="btn btn-secondary btn-small admin-danger"
                              onClick={() => handleDeleteOrder(order._id)}
                            >
                              REMOVE
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addProduct' && (
            <div>
              <h2>
                PUBLISH BRAND DROP
              </h2>

              <form onSubmit={handleAddProductSubmit}>
                <div className="form-group">
                  <label className="brutalist-label">PRODUCT NAME</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="ENTER PRODUCT NAME"
                    value={newProduct.name} 
                    onChange={handleInputChange} 
                    required 
                    className="brutalist-input"
                  />
                </div>

                <div className="form-group">
                  <label className="brutalist-label">DESCRIPTION / GSM DETAIL</label>
                  <textarea 
                    name="description" 
                    placeholder="ENTER PRODUCT DETAILS (E.G. 240 GSM DROP-SHOULDER TEES)"
                    value={newProduct.description} 
                    onChange={handleInputChange} 
                    required 
                    rows="3"
                    className="brutalist-input"
                    style={{ fontFamily: 'inherit' }}
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label className="brutalist-label">PRICE (INR)</label>
                    <input 
                      type="number" 
                      name="price" 
                      placeholder="INR"
                      value={newProduct.price} 
                      onChange={handleInputChange} 
                      required 
                      className="brutalist-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="brutalist-label">STOCK QUANTITY</label>
                    <input 
                      type="number" 
                      name="stock" 
                      placeholder="STOCK UNITS"
                      value={newProduct.stock} 
                      onChange={handleInputChange} 
                      required 
                      className="brutalist-input"
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label className="brutalist-label">DROP COLLECTION</label>
                    <select 
                      name="category"
                      value={newProduct.category} 
                      onChange={handleInputChange}
                      className="brutalist-input"
                    >
                      <option value="Anime">ANIME CORE</option>
                      <option value="Graphic">Y2K GRAPHIC</option>
                      <option value="Limited">POP CULTURE</option>
                      <option value="Footwear">FOOTWEAR</option>
                      <option value="Accessories">ACCESSORIES</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="brutalist-label">UPLOAD PRODUCT IMAGE</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload} 
                      className="brutalist-input"
                      style={{ padding: '0.9rem 1.2rem' }}
                    />
                    {uploadingImage && <div style={{ fontSize: '0.85rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>[ UPLOADING ASSET TO PIPELINE... ]</div>}
                    {newProduct.image && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ASSET LOGGED: {newProduct.image}
                      </div>
                    )}
                  </div>

                </div>

                <button 
                  type="submit" 
                  disabled={publishing}
                  className="btn btn-primary" 
                  style={{ marginTop: '1.5rem' }}
                >
                  {publishing ? 'PUBLISHING TO CATALOG...' : 'RELEASE DROP'}
                </button>
              </form>

              {formStatus.success && (
                <div className="success-message">
                  {formStatus.success}
                </div>
              )}
              {formStatus.error && (
                <div className="error-message">
                  {formStatus.error}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
