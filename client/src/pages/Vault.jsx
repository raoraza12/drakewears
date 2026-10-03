import React, { useState, useEffect } from 'react';
import { FiLock, FiBell, FiCheck } from 'react-icons/fi';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import './Vault.css';

const VAULT_PIECES = [
  {
    id: 'pant',
    title: 'Vintage Double-Knee Baggy Pant',
    edition: '1 OF 1',
    status: 'SEALED',
  },
  {
    id: 'tee',
    title: 'Heavyweight Boxy Drop-Tee',
    edition: '1 OF 1',
    status: 'SEALED',
  },
  {
    id: 'cap',
    title: 'Archive Washed 6-Panel Cap',
    edition: '1 OF 1',
    status: 'SEALED',
  },
];

const Vault = () => {
  const { settings } = useSettings();
  const phone = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923218254922';
  const [notified, setNotified] = useState({});

  useEffect(() => {
    document.title = 'The Drake Vault | 1-of-1 Archive';
  }, []);

  const handleNotify = (title) => {
    setNotified((prev) => ({ ...prev, [title]: true }));
    const text = encodeURIComponent(`Hi DrakeWears, notify me for the 1-of-1 piece "${title}"!`);
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, '_blank');
  };

  return (
    <div className="vault-minimal-page">
      <div className="container vault-minimal-inner">
        {/* Minimal Editorial Hero */}
        <div className="vault-minimal-hero">
          <div className="vault-minimal-tag">
            <FiLock size={12} color="#f59e0b" />
            <span>ARCHIVE DROP #01</span>
          </div>

          <h1 className="vault-minimal-title">THE DRAKE VAULT</h1>
          <p className="vault-minimal-slogan">1-of-1 Curated Streetwear Archive</p>

          <div className="vault-minimal-coming-soon">
            <span className="cs-pulse-dot"></span>
            <span>COMING SOON</span>
          </div>

          <div className="vault-minimal-actions">
            <a
              href={`https://api.whatsapp.com/send?phone=${phone}&text=Hi%20DrakeWears,%20notify%20me%20when%20The%20Drake%20Vault%20drops!`}
              target="_blank"
              rel="noopener noreferrer"
              className="vault-btn-whatsapp"
            >
              <FaWhatsapp size={16} /> Notify on WhatsApp
            </a>
            <a
              href="https://www.instagram.com/drakewears_official"
              target="_blank"
              rel="noopener noreferrer"
              className="vault-btn-instagram"
            >
              <FaInstagram size={16} /> Follow on IG
            </a>
          </div>
        </div>

        {/* 3 Clean Visual Cards — Zero Text Clutter */}
        <div className="vault-minimal-grid">
          {VAULT_PIECES.map((piece) => (
            <div key={piece.id} className="vault-minimal-card">
              <div className="vault-card-frame">
                <span className="vault-edition-chip">{piece.edition}</span>
                <div className="vault-lock-indicator">
                  <div className="vault-lock-orb-sm">
                    <FiLock size={22} color="#f59e0b" />
                  </div>
                  <span className="vault-status-text">{piece.status}</span>
                </div>
              </div>

              <div className="vault-card-meta">
                <h3 className="vault-piece-title">{piece.title}</h3>
                <button
                  onClick={() => handleNotify(piece.title)}
                  className={`vault-notify-btn ${notified[piece.title] ? 'is-done' : ''}`}
                >
                  {notified[piece.title] ? (
                    <>
                      <FiCheck size={14} /> VIP Access Requested
                    </>
                  ) : (
                    <>
                      <FiBell size={14} /> Notify Me
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vault;
