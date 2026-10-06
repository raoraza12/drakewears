import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiArrowRight } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import SEOHead from '../components/SEOHead';
import './Vault.css';

const Vault = () => {
  const { settings } = useSettings();
  const phone = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923218254922';

  useEffect(() => {
    document.title = 'The Drake Vault | Coming Soon';
  }, []);

  return (
    <div className="vault-page-clean">
      <SEOHead
        title="The Drake Vault - Coming Soon | DRAKEWEARS Pakistan"
        description="The Drake Vault: Exclusive 1-of-1 curated streetwear archive drops. Coming soon."
      />
      <div className="container vault-inner-clean">
        <div className="vault-clean-content">
          <div className="vault-clean-badge">
            <FiLock size={13} color="#f59e0b" />
            <span>ARCHIVE VAULT</span>
          </div>

          <h1 className="vault-clean-title">THE DRAKE VAULT</h1>
          
          <div className="vault-clean-hero-box">
            <span className="vault-pulse-dot"></span>
            <span className="vault-coming-soon-text">COMING SOON</span>
          </div>

          <p className="vault-clean-desc">
            Curated 1-of-1 Streetwear Archive drops are currently sealed. Exclusive pieces will be released soon.
          </p>

          <div className="vault-clean-actions">
            <Link to="/shop" className="btn-primary vault-shop-btn">
              Explore Available Collection <FiArrowRight size={16} />
            </Link>
            <a
              href={`https://api.whatsapp.com/send?phone=${phone}&text=Hi%20DrakeWears,%20please%20notify%20me%20when%20The%20Drake%20Vault%20drops!`}
              target="_blank"
              rel="noopener noreferrer"
              className="vault-clean-whatsapp"
            >
              <FaWhatsapp size={16} /> Get VIP WhatsApp Alert
            </a>
            <a
              href="https://www.instagram.com/drakewears_official"
              target="_blank"
              rel="noopener noreferrer"
              className="vault-clean-instagram"
            >
              <FaInstagram size={16} /> Follow on Instagram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
