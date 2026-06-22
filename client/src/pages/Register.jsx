import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    if (user) {
      navigate(redirect ? `/${redirect}` : '/');
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-section animate-fade-in">
      <div className="auth-container">
        <div className="auth-box">
          <h1>CREATE ACCOUNT</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="brutalist-label">Full Name</label>
              <input 
                type="text" 
                placeholder="ENTER FULL NAME" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                className="brutalist-input"
              />
            </div>

            <div className="form-group">
              <label className="brutalist-label">Email Address</label>
              <input 
                type="email" 
                placeholder="ENTER EMAIL ADDRESS" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="brutalist-input"
              />
            </div>
            
            <div className="form-group">
              <label className="brutalist-label">Password</label>
              <input 
                type="password" 
                placeholder="ENTER PASSWORD (MIN. 6 CHARS)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="brutalist-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary" 
            >
              {loading ? 'CREATING IDENTITY...' : 'JOIN THE CULTURE'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <p style={{ marginTop: '2rem' }}>
            ALREADY ENLISTED? <Link to={`/login${redirect ? `?redirect=${redirect}` : ''}`}>SIGN IN</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
