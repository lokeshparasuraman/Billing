import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User as UserIcon, LogIn, UserPlus, FileText, AlertCircle } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#051c1a',
        color: '#ffffff',
        fontFamily: '"Space Grotesk", "Outfit", "Inter", sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient lighting matching theme */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '-160px',
            left: '-160px',
            width: '384px',
            height: '384px',
            backgroundColor: 'rgba(201, 242, 39, 0.08)',
            borderRadius: '9999px',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-160px',
            right: '-160px',
            width: '384px',
            height: '384px',
            backgroundColor: 'rgba(10, 56, 50, 0.6)',
            borderRadius: '9999px',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#0a2421',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          padding: '32px 28px',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(201, 242, 39, 0.12)',
              border: '1px solid rgba(201, 242, 39, 0.25)',
              color: '#c9f227',
              marginBottom: '16px',
            }}
          >
            <FileText style={{ width: 28, height: 28 }} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            OWSHIKA ENTERPRISES
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px', margin: 0 }}>
            Smart Billing & Invoice Management System
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(5, 28, 26, 0.8)',
            padding: '4px',
            borderRadius: '14px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              backgroundColor: isLoginTab ? '#c9f227' : 'transparent',
              color: isLoginTab ? '#051c1a' : 'rgba(255, 255, 255, 0.6)',
              boxShadow: isLoginTab ? '0 4px 12px rgba(201, 242, 39, 0.25)' : 'none',
            }}
          >
            <LogIn style={{ width: 16, height: 16 }} /> Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              backgroundColor: !isLoginTab ? '#c9f227' : 'transparent',
              color: !isLoginTab ? '#051c1a' : 'rgba(255, 255, 255, 0.6)',
              boxShadow: !isLoginTab ? '0 4px 12px rgba(201, 242, 39, 0.25)' : 'none',
            }}
          >
            <UserPlus style={{ width: 16, height: 16 }} /> Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLoginTab && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                }}
              >
                Full Name / Business Owner
              </label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '12px',
                    width: '18px',
                    height: '18px',
                    color: 'rgba(255, 255, 255, 0.4)',
                  }}
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. C. Perumal"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(5, 28, 26, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    paddingLeft: '44px',
                    paddingRight: '14px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#c9f227')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
                />
              </div>
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '12px',
                  width: '18px',
                  height: '18px',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(5, 28, 26, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  paddingLeft: '44px',
                  paddingRight: '14px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#c9f227')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '12px',
                  width: '18px',
                  height: '18px',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(5, 28, 26, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  paddingLeft: '44px',
                  paddingRight: '14px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#c9f227')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)')}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '12px',
              backgroundColor: '#c9f227',
              color: '#051c1a',
              fontWeight: 800,
              fontSize: '15px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 6px 20px rgba(201, 242, 39, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.15s, opacity 0.15s',
            }}
          >
            {loading ? (
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(5, 28, 26, 0.3)',
                  borderTopColor: '#051c1a',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            ) : isLoginTab ? (
              <>
                <LogIn style={{ width: 18, height: 18 }} /> Sign In to Dashboard
              </>
            ) : (
              <>
                <UserPlus style={{ width: 18, height: 18 }} /> Create Account
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '24px', margin: 0 }}>
          Secured with encrypted credentials & cloud persistence
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
