import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User as UserIcon, LogIn, UserPlus, FileText, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(5, 28, 26, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    paddingLeft: '44px',
    paddingRight: '44px',
    paddingTop: '11px',
    paddingBottom: '11px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: '"Space Grotesk", "Outfit", "Inter", sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box' as const,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '6px',
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
      {/* Ambient background glow — matches website theme */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            left: '-120px',
            width: '380px',
            height: '380px',
            backgroundColor: 'rgba(201, 242, 39, 0.07)',
            borderRadius: '9999px',
            filter: 'blur(90px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            right: '-120px',
            width: '380px',
            height: '380px',
            backgroundColor: 'rgba(10, 56, 50, 0.6)',
            borderRadius: '9999px',
            filter: 'blur(90px)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0a2421',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
          padding: '32px 28px 28px',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'rgba(201, 242, 39, 0.13)',
              border: '1px solid rgba(201, 242, 39, 0.22)',
              color: '#c9f227',
              marginBottom: '14px',
            }}
          >
            <FileText style={{ width: 26, height: 26 }} />
          </div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '0 0 4px',
              textTransform: 'uppercase',
            }}
          >
            Owshika Enterprises
          </h1>
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
            Smart Billing & Invoice Management
          </p>
        </div>

        {/* ── Liquid Slide Toggle (same style as Customer/Transport bill toggle) ── */}
        <div
          style={{
            position: 'relative',
            display: 'inline-grid',
            gridTemplateColumns: '1fr 1fr',
            padding: '6px',
            borderRadius: '18px',
            width: '100%',
            userSelect: 'none',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: 'rgba(5, 28, 26, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
            marginBottom: '24px',
          }}
        >
          {/* Liquid sliding pill indicator */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              bottom: '6px',
              left: '6px',
              width: 'calc(50% - 6px)',
              borderRadius: '12px',
              backgroundColor: '#c9f227',
              boxShadow: '0 3px 10px rgba(201, 242, 39, 0.40)',
              zIndex: 0,
              transform: isLoginTab ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />

          {/* Log In tab */}
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setError(null); }}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: isLoginTab ? '#051c1a' : 'rgba(255, 255, 255, 0.55)',
              fontSize: '13px',
              fontWeight: 900,
              fontFamily: '"Space Grotesk", "Outfit", "Inter", sans-serif',
              letterSpacing: '0.01em',
              transition: 'color 0.3s',
            }}
          >
            <LogIn style={{ width: 15, height: 15, flexShrink: 0 }} />
            <span>Log In</span>
          </button>

          {/* Sign Up tab */}
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setError(null); }}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: !isLoginTab ? '#051c1a' : 'rgba(255, 255, 255, 0.55)',
              fontSize: '13px',
              fontWeight: 900,
              fontFamily: '"Space Grotesk", "Outfit", "Inter", sans-serif',
              letterSpacing: '0.01em',
              transition: 'color 0.3s',
            }}
          >
            <UserPlus style={{ width: 15, height: 15, flexShrink: 0 }} />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              marginBottom: '18px',
              padding: '11px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.11)',
              border: '1px solid rgba(239, 68, 68, 0.28)',
              borderRadius: '12px',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertCircle style={{ width: 17, height: 17, flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name field — sign up only */}
          {!isLoginTab && (
            <div>
              <label style={labelStyle}>Full Name / Business Owner</label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    width: '17px', height: '17px', color: 'rgba(255,255,255,0.35)',
                  }}
                />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. C. Perumal"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#c9f227')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  width: '18px', height: '18px', color: '#c9f227', zIndex: 20,
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="auth-input-field"
                style={{ ...inputStyle, paddingRight: '52px' }}
                onFocus={(e) => (e.target.style.borderColor = '#c9f227')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
            </div>
          </div>

          {/* Password field with eye toggle */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  width: '18px', height: '18px', color: '#c9f227', zIndex: 20,
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input-field"
                style={{ ...inputStyle, paddingRight: '52px' }}
                onFocus={(e) => (e.target.style.borderColor = '#c9f227')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
              />
              {/* Eye toggle button — Google / Microsoft style: borderless, sleek & modern */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 30,
                  transition: 'background-color 0.15s, color 0.15s',
                  color: showPassword ? '#c9f227' : 'rgba(255, 255, 255, 0.75)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                  el.style.color = '#c9f227';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.backgroundColor = 'transparent';
                  el.style.color = showPassword ? '#c9f227' : 'rgba(255, 255, 255, 0.75)';
                }}
              >
                {showPassword ? (
                  <EyeOff style={{ width: 19, height: 19 }} />
                ) : (
                  <Eye style={{ width: 19, height: 19 }} />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '8px',
              backgroundColor: '#c9f227',
              color: '#051c1a',
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '0.01em',
              fontFamily: '"Space Grotesk", "Outfit", "Inter", sans-serif',
              padding: '13px 16px',
              borderRadius: '13px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              boxShadow: '0 6px 22px rgba(201, 242, 39, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(201, 242, 39, 0.40)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 22px rgba(201, 242, 39, 0.28)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            {loading ? (
              <span
                style={{
                  display: 'inline-block',
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(5, 28, 26, 0.3)',
                  borderTopColor: '#051c1a',
                  borderRadius: '50%',
                  animation: 'auth-spin 0.75s linear infinite',
                }}
              />
            ) : isLoginTab ? (
              <>
                <LogIn style={{ width: 16, height: 16 }} />
                Sign In to Dashboard
              </>
            ) : (
              <>
                <UserPlus style={{ width: 16, height: 16 }} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.3)',
            marginTop: '20px',
            marginBottom: 0,
          }}
        >
          Secured with encrypted credentials & cloud persistence
        </p>
      </div>

      <style>{`
        @keyframes auth-spin {
          to { transform: rotate(360deg); }
        }
        input.auth-input-field:-webkit-autofill,
        input.auth-input-field:-webkit-autofill:hover,
        input.auth-input-field:-webkit-autofill:focus,
        input.auth-input-field:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #051c1a inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};
