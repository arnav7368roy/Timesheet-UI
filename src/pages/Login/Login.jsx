import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Clock } from 'lucide-react';
import loginArtwork from '../../assets/login_artwork.png';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Forgot Password modal & form states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await login(email.trim(), password.trim());
      if (res.success) {
        navigate('/');
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotNewPassword || !forgotConfirmPassword) {
      setForgotError('Please fill in all fields.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    setIsForgotSubmitting(true);
    setForgotError('');
    setForgotSuccess('');
    try {
      const url = `https://timesheet-2-e5cr.onrender.com/api/v1/auth/forgot-password`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          password: forgotNewPassword,
          confirmPassword: forgotConfirmPassword,
        }),
      });
      const data = await response.json();
      if (response.ok && data.status) {
        setForgotSuccess('Password reset successfully! Please login with your new password.');
        setForgotEmail('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotSuccess('');
        }, 3000);
      } else {
        setForgotError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setForgotError('An unexpected error occurred.');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        
        {/* Left Artwork Column */}
        <div className="login-left">
          <div className="glass-card">
            <h1>Empowering people through seamless HR management.</h1>
            <img src={loginArtwork} alt="Workspace Team Collaboration" className="glass-artwork" />
            <p>Efficiently manage your workforce, track attendance, monitor projects, and streamline operations effortlessly.</p>
          </div>
        </div>

        {/* Right Sign-In Form Column */}
        <div className="login-right">
          
          {/* Logo Header */}
          <div className="login-header">
            <Clock className="login-logo-icon" size={26} />
            <span className="login-logo-text">SmartHR</span>
          </div>

          {/* Form Container */}
          <div className="login-form-container">
            <h2>Sign In</h2>
            <p className="login-subtitle">Please enter your details to sign in</p>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-input-group">
                <label>Email Address</label>
                <div className="login-input-wrapper">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail className="login-input-icon" size={18} />
                </div>
              </div>

              <div className="login-input-group">
                <label>Password</label>
                <div className="login-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="login-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                </div>
              </div>

              <div className="login-options">
                <label className="login-remember-me">
                  <input type="checkbox" />
                  <span>Remember Me</span>
                </label>
                <span className="login-forgot-link" onClick={() => setShowForgotModal(true)}>
                  Forgot Password?
                </span>
              </div>

              <button
                className="login-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Please Wait...' : 'Sign In'}
              </button>

              {errorMsg && <p className="login-msg">{errorMsg}</p>}
            </form>
          </div>

          {/* Footer */}
          <div className="login-footer">
            Copyright &copy; 2026 - SmartHR
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '450px',
            padding: '30px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            position: 'relative',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              Reset Password
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
              Enter your email and new password to reset it.
            </p>

            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', textAlign: 'left' }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {forgotError && (
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#ef4444', fontWeight: '600', textAlign: 'left' }}>
                  {forgotError}
                </p>
              )}

              {forgotSuccess && (
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#10b981', fontWeight: '600', textAlign: 'left' }}>
                  {forgotSuccess}
                </p>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotError('');
                    setForgotSuccess('');
                    setForgotEmail('');
                    setForgotNewPassword('');
                    setForgotConfirmPassword('');
                  }}
                  style={{
                    flex: 1,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isForgotSubmitting}
                  style={{
                    flex: 1,
                    background: '#f97316',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {isForgotSubmitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling Constants for Modal Inputs
const inputStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};
