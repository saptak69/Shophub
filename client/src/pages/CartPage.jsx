import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, showToast } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!user) {
      showToast('ACCESS DENIED • SIGN IN TO CHECKOUT');
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };


  const total = getCartTotal();

  return (
    <div className="cart-page container animate-fade-in" style={{ padding: '3rem 0' }}>
      <h1 className="section-title">YOUR BAG</h1>

      {cartItems.length === 0 ? (
        <div className="empty-state">
          <p>YOUR BAG IS EMPTY.</p>
          <Link to="/shop" className="btn btn-primary" style={{ width: 'auto' }}>
            BROWSE CATALOG
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          {/* Cart items list */}
          <div className="cart-items" style={{ display: 'flex', flexDirection: 'column' }}>
            {cartItems.map((item) => (
              <div 
                key={item.productId} 
                className="cart-line-item" 
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="cart-line-image" 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/120x120?text=No+Image';
                  }}
                />
                
                <div className="cart-line-content">
                  <div className="cart-line-header">
                    <div>
                      <div className="cart-line-name">{item.name}</div>
                      <div className="cart-line-price">
                        Rs {Number(item.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="cart-line-total">
                      Rs {Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                  
                  <div className="cart-line-footer">
                    <div className="cart-line-quantity">
                      <button 
                        className="cart-qty-btn" 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        readOnly 
                        className="cart-qty-input" 
                      />
                      <button 
                        className="cart-qty-btn" 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button 
                      className="cart-remove-btn" 
                      onClick={() => removeFromCart(item.productId)}
                    >
                      [ REMOVE ]
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart summary */}
          <div className="cart-summary">
            <h2>ORDER SUMMARY</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs {Number(total).toLocaleString('en-IN')}</span>
            </div>
            
            <div className="summary-row">
              <span>Delivery</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>FREE</span>
            </div>

            <div className="summary-row total">
              <span>Total</span>
              <span>Rs {Number(total).toLocaleString('en-IN')}</span>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleCheckoutClick}
              style={{ marginTop: '2rem' }}
            >
              PROCEED TO SECURE CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
