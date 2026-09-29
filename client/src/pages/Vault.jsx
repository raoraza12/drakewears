import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import './Vault.css';

const Vault = () => {
  const { settings } = useSettings();
  const phone = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923218254922';

  useEffect(() => {
    document.title = 'The Drake Vault | Coming Soon';
  }, []);

  return (
    <div className="vault-page vault-coming-soon-page">
      <div className="vault-hero-ambient"></div>

      <div className="container vault-cs-inner">
        {/* Lock Tag */}
        <div className="vault-cs-badge">
          <FiLock size={14} color="#f59e0b" />
          <span>VAULT ARCHIVE • DROP #01</span>
        </div>

        {/* Title */}
        <h1 className="vault-cs-title">THE DRAKE VAULT</h1>

        {/* Slogan */}
        <p className="vault-cs-slogan">
          1-of-1 Curated Vintage &amp; Archive Pieces
        </p>

        {/* Big Bold COMING SOON Banner */}
        <div className="vault-cs-highlight">
          <span className="vault-cs-big-text">COMING SOON</span>
        </div>

        <p className="vault-cs-desc">
          Drop 01 is currently in preparation. Each piece is an authentic 1-of-1 grail. 
          Follow our updates to unlock access first.
        </p>

        {/* Action Buttons */}
        <div className="vault-cs-actions">
          <Link to="/shop" className="vault-cs-btn-primary">
            Explore Shop <FiArrowRight size={16} />
          </Link>
          <a 
            href={`https://api.whatsapp.com/send?phone=${phone}&text=Hi%20DrakeWears,%20notify%20me%20when%20The%20Drake%20Vault%20drops!`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="vault-cs-btn-whatsapp"
          >
            <FaWhatsapp size={16} /> Notify on WhatsApp
          </a>
          <a 
            href="https://www.instagram.com/drakewears_official" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="vault-cs-btn-instagram"
          >
            <FaInstagram size={16} /> Follow on IG
          </a>
        </div>
      </div>
    </div>
  );
};

export default Vault;
