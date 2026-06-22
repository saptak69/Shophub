import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart, showToast } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      showToast('VALIDATION ERROR • FILL ALL SHIPPING FIELDS');
      return;
    }

    if (cartItems.length === 0) {
      showToast('TRANSACTION ERROR • EMPTY BAG');
      navigate('/shop');
      return;
    }

    setIsSubmitting(true);

    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress,
          paymentMethod
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Order placement failed');
      }

      // Clear cart globally
      await clearCart();
      showToast('ORDER PLACED SUCCESSFULLY • LOADING PROFILE');
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err) {
      console.error('Checkout error:', err);
      showToast(`TRANSACTION FAILURE • ${err.message.toUpperCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  const total = getCartTotal();
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (!user) return null;

  return (
    <div className="checkout-page container animate-fade-in" style={{ padding: '3rem 0' }}>
      <h1 className="section-title" style={{ textTransform: 'uppercase', textAlign: 'center' }}>CHECKOUT TERMINAL</h1>

      <div className="checkout-grid">
        <form onSubmit={handleSubmit} className="checkout-form" style={{ padding: '2.5rem' }}>
          <div className="form-section" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
              SHIPPING ADDRESS
            </h2>
            <div className="form-group">
              <label className="brutalist-label">Street Address</label>
              <input 
                type="text" 
                name="street" 
                placeholder="STREET ADDRESS" 
                value={shippingAddress.street} 
                onChange={handleInputChange} 
                className="brutalist-input"
                required 
              />
            </div>
            <div className="form-group">
              <label className="brutalist-label">City</label>
              <input 
                type="text" 
                name="city" 
                placeholder="CITY" 
                value={shippingAddress.city} 
                onChange={handleInputChange} 
                className="brutalist-input"
                required 
              />
            </div>
            <div className="form-group">
              <label className="brutalist-label">State</label>
              <input 
                type="text" 
                name="state" 
                placeholder="STATE" 
                value={shippingAddress.state} 
                onChange={handleInputChange} 
                className="brutalist-input"
                required 
              />
            </div>
            <div className="form-group">
              <label className="brutalist-label">Pin / Zip Code</label>
              <input 
                type="text" 
                name="zipCode" 
                placeholder="ZIP CODE" 
                value={shippingAddress.zipCode} 
                onChange={handleInputChange} 
                className="brutalist-input"
                required 
              />
            </div>
            <div className="form-group">
              <label className="brutalist-label">Country</label>
              <input 
                type="text" 
                name="country" 
                placeholder="COUNTRY" 
                value={shippingAddress.country} 
                onChange={handleInputChange} 
                className="brutalist-input"
                required 
              />
            </div>
          </div>

          <div className="form-section" style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
              PAYMENT METHOD
            </h2>
            <div className="form-group">
              <label className="brutalist-label">Select Method</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="brutalist-input"
              >
                <option value="UPI">UPI / NET BANKING</option>
                <option value="COD">CASH ON DELIVERY (COD)</option>
                <option value="Card">CREDIT / DEBIT CARD</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || cartItems.length === 0} 
            className="btn btn-primary" 
            style={{ width: '100%' }}
          >
            {isSubmitting ? 'PROCESSING TRANSACTION...' : 'PLACE ORDER'}
          </button>
        </form>

        <div className="cart-summary" style={{ padding: '2rem' }}>
          <h2 style={{ textTransform: 'uppercase' }}>
            YOUR SELECTION
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '250px', overflowY: 'auto', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)' }}>
            {cartItems.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.925rem', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700 }}>{item.name} X {item.quantity}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Rs {Number(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>Rs {Number(total).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
