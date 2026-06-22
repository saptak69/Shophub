import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const [bump, setBump] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const cartCount = getCartCount();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    setIsOpen(false);
    navigate('/');
  };

  useEffect(() => {
    if (cartCount === 0) return;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 250);
    return () => clearTimeout(timer);
  }, [cartCount]);

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand" onClick={() => setIsOpen(false)}>
          <img src="/assets/logo-mark.svg" alt="Mangrove M sigil" style={{ width: '24px', marginRight: '8px', verticalAlign: 'middle' }} />
          <span className="brand-wordmark">MANGROVE</span>
        </Link>
        <button 
          className="nav-toggle" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '[ CLOSE ]' : '[ MENU ]'}
        </button>
        <ul className={`nav-menu ${isOpen ? 'open' : ''}`}>
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end onClick={() => setIsOpen(false)}>
              Drops
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsOpen(false)}>
              Shop
            </NavLink>
          </li>
          <li>
            <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsOpen(false)}>
              Cart <span className={`cart-count ${bump ? 'cart-count-bump' : ''}`}>{cartCount}</span>
            </NavLink>
          </li>

          {user ? (
            <>
              {user.role === 'admin' && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsOpen(false)}>
                    Admin
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsOpen(false)}>
                  Profile
                </NavLink>
              </li>
              <li>
                <a href="#logout" onClick={handleLogout} className="logout-btn">
                  Logout
                </a>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsOpen(false)}>
                Login
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
