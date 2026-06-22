import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Marquee from './components/Marquee';
import Toast from './components/Toast';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            <Marquee />
            <Navbar />
            <Toast />
            <main className="main-content">

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            
            {/* Footer */}
            <footer className="footer" style={{ borderTop: '1px solid var(--border-color)', padding: '3rem 2rem', marginTop: '5rem', backgroundColor: 'var(--bg-surface)' }}>
              <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>SHOPHUB</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Unapologetic graphic tees, heavy knits, and tech wear. Intentionally raw.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-muted)' }}>COLLECTIONS</h4>
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li><Link to="/shop?category=Anime" style={{ color: 'inherit', textDecoration: 'none' }}>Anime Core</Link></li>
                    <li><Link to="/shop?category=Graphic" style={{ color: 'inherit', textDecoration: 'none' }}>Y2K Graphic</Link></li>
                    <li><Link to="/shop?category=Limited" style={{ color: 'inherit', textDecoration: 'none' }}>Pop Culture</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-muted)' }}>SYSTEM</h4>
                  <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li><Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>Terminal Profile</Link></li>
                    <li><Link to="/admin" style={{ color: 'inherit', textDecoration: 'none' }}>Control Panel</Link></li>
                    <li><span style={{ color: 'var(--text-muted)' }}>v1.2.0-react</span></li>
                  </ul>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
