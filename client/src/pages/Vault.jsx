import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLock, FiArrowRight, FiShield, FiPackage, FiZap } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import API from '../api';
import './Vault.css';

const Vault = () => {
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const phone = settings?.contactPhone ? settings.contactPhone.replace(/[^0-9]/g, '') : '923218254922';

  useEffect(() => {
    document.title = 'The Drake Vault | Exclusive 1-of-1 Streetwear Archive';
    
    API.get('/products?limit=1000')
      .then(res => {
        const allProds = res.data.products || res.data || [];
        const vaultItems = allProds.filter(p => {
          const cat = (p.category || '').toLowerCase().trim();
          return cat === 'drake vault' || cat.includes('vault');
        });
        setProducts(vaultItems);
      })
      .catch(err => {
        console.error('Error fetching vault items:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="vault-page-wrapper">
      <SEOHead
        title="The Drake Vault | 1-of-1 Curated Streetwear Archive"
        description="Explore The Drake Vault: strictly limited 1-of-1 curated streetwear archive pieces, bespoke prototypes, and exclusive garments in Pakistan."
        url="https://drakewears.com/vault"
      />

      <div className="container vault-container">
        
        {/* Header Hero - Clean Minimalist */}
        <header className="vault-header-hero">
          <h1 className="vault-main-title">THE DRAKE VAULT</h1>
          <p className="vault-main-subtitle">
            1-of-1 Curated Pieces
          </p>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="vault-loading-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="vault-skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-price"></div>
              </div>
            ))}
          </div>
        )}

        {/* Active Products Showroom */}
        {!loading && products.length > 0 && (
          <section className="vault-showroom-section">
            <div className="vault-products-grid">
              {products.map(product => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>

            {/* VIP WhatsApp Inquiry Box */}
            <div className="vault-vip-card">
              <div className="vault-vip-info">
                <h3>Looking for Custom Archive Grails?</h3>
                <p>Contact our master atelier directly on WhatsApp for custom 1-of-1 inquiries or bespoke fittings.</p>
              </div>
              <a
                href={`https://api.whatsapp.com/send?phone=${phone}&text=Hi%20DrakeWears,%20I%20am%20inquiring%20about%20The%20Drake%20Vault%20collection.`}
                target="_blank"
                rel="noopener noreferrer"
                className="vault-vip-btn"
              >
                <FaWhatsapp size={18} /> Chat with Atelier Concierge
              </a>
            </div>
          </section>
        )}

        {/* Empty State / Coming Soon Fallback */}
        {!loading && products.length === 0 && (
          <div className="vault-clean-content">
            <div className="vault-clean-hero-box">
              <span className="vault-pulse-dot"></span>
              <span className="vault-coming-soon-text">ARCHIVE CURRENTLY SEALED</span>
            </div>

            <p className="vault-clean-desc">
              All 1-of-1 archive grails have been claimed or are currently being prepared for the next drop. Get on the VIP list to be notified first.
            </p>

            <div className="vault-clean-actions">
              <Link to="/shop" className="btn-primary vault-shop-btn">
                Explore Available Retail Collection <FiArrowRight size={16} />
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
        )}

      </div>
    </div>
  );
};

export default Vault;
