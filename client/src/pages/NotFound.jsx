import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-primary)' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '12px', marginBottom: '16px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
          The page you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>
        <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex', padding: '14px 28px' }}>
          Explore Collection
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
