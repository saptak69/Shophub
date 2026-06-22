import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      navigate(redirect ? `/${redirect}` : '/');
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      // AuthContext will update user state, which triggers the useEffect redirect
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-section animate-fade-in">
      <div className="auth-container">
        <div className="auth-box">
          <h1>SIGN IN</h1>
          
          <form onSubmit={handleSubmit}>
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
                placeholder="ENTER PASSWORD" 
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
              {loading ? 'AUTHENTICATING...' : 'ACCESS ACCOUNT'}
            </button>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <p style={{ marginTop: '2rem' }}>
            NEW RECRUIT? <Link to={`/register${redirect ? `?redirect=${redirect}` : ''}`}>CREATE AN ACCOUNT</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
