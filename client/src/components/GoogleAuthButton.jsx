import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function GoogleAuthButton({ isSignUp = false, onError, redirect = '/' }) {
  const googleBtnRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  // Official Google Client ID provided by user
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '127671825423-nm05na7t5f9upond54tk5moshjhcj8rs.apps.googleusercontent.com';

  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      toast.error('Google sign-in was cancelled or failed.');
      return;
    }

    setLoading(true);
    try {
      const userData = await googleLogin(response.credential);
      toast.success(`Welcome, ${userData.name}! Verified with Google ✨`);
      if (userData.role === 'admin') {
        navigate('/drakewearsofficial');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      const msg = err.response?.data?.message || 'Google authentication failed. Please try again.';
      toast.error(msg);
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientId) return;

    let intervalId;
    let attempts = 0;

    const renderGsi = () => {
      attempts++;
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          const parentW = googleBtnRef.current.parentElement?.offsetWidth || 340;
          const buttonWidth = Math.min(380, Math.max(260, parentW));

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: isSignUp ? 'signup_with' : 'signin_with',
            logo_alignment: 'left',
            width: buttonWidth,
          });

          setGisReady(true);
          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.warn('Google Identity Services render attempt error:', err);
        }
      }

      if (attempts > 30 && intervalId) {
        clearInterval(intervalId);
      }
    };

    if (window.google?.accounts?.id) {
      renderGsi();
    } else {
      intervalId = setInterval(renderGsi, 250);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [clientId, isSignUp]);

  const handleManualClick = () => {
    if (loading) return;

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          toast.error('Google popup was suppressed by browser. Please allow popups or click the button directly.');
        }
      });
      return;
    }

    toast.error('Google Identity Services is still loading. Please wait a moment or check your connection.');
  };

  return (
    <div className="google-auth-container">
      {/* Official Google GSI Mount Container (Direct Device Account Chooser) */}
      <div 
        ref={googleBtnRef} 
        className="google-gsi-wrapper"
        style={{
          position: gisReady ? 'static' : 'absolute',
          opacity: gisReady ? 1 : 0,
          pointerEvents: gisReady ? 'auto' : 'none',
          minHeight: '44px',
          display: 'flex',
          justifyContent: 'center',
          width: '100%'
        }}
      />

      {/* Fallback Luxury DrakeWears Google Button while GIS is rendering */}
      {!gisReady && (
        <button
          type="button"
          onClick={handleManualClick}
          className="btn-google-custom"
          disabled={loading}
          aria-label={isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
        >
          <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span className="google-btn-text">
            {loading 
              ? 'Connecting to Google...' 
              : isSignUp 
                ? 'Sign up with Google' 
                : 'Sign in with Google'}
          </span>
        </button>
      )}
    </div>
  );
}
