import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DRAKEWEARS ErrorBoundary Caught]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0c',
          color: '#ffffff',
          padding: '24px',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#141418',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#ef4444'
            }}>
              <FiAlertTriangle size={32} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Unexpected State Encountered
            </h1>
            <p style={{ color: '#a1a1aa', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '28px' }}>
              A temporary interface issue occurred. Your cart and session data are safe. Please reload the view to continue.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={this.handleReload}
                style={{
                  padding: '12px 28px',
                  background: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FiRefreshCw size={16} /> Reload Page
              </button>
              <a 
                href="/" 
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Back to Store
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
