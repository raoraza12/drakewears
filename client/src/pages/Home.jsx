import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [heroIdx, setHeroIdx] = useState(0);

  const heroImages = [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
  ];

  const tabs = ['ALL', 'WOMENSWEAR', 'MENSWEAR', 'ACCESSORIES'];

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([
      API.get(`/products?featured=true&limit=4&_t=${Date.now()}`),
      API.get(`/products?newArrival=true&limit=20&_t=${Date.now()}`),
    ]).then(([f, n]) => {
      setFeatured(f.data.products);
      setNewArrivals(n.data.products);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filteredArrivals = newArrivals.filter(p => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'WOMENSWEAR') return p.category === 'Women';
    if (activeTab === 'MENSWEAR') return p.category === 'Men';
    if (activeTab === 'ACCESSORIES') return p.category === 'Accessories';
    return true;
  }).slice(0, 4);

  return (
    <div className="maison-home">
      
      {/* Split-Screen Hero */}
      <section className="maison-hero">
        <div className="maison-hero-left">
          <div className="maison-hero-content">
            <h1 className="maison-hero-title">THE ART<br/>OF<br/>ENOUGH.</h1>
            <p className="maison-hero-desc">
              Discover the Autumn/Winter 2024 Collection.<br/>A study in silhouette and texture.
            </p>
            <Link to="/shop" className="btn-primary">EXPLORE COLLECTION</Link>
          </div>
        </div>
        <div className="maison-hero-right">
          {heroImages.map((src, i) => (
            <div 
              key={i} 
              className={`hero-carousel-slide ${i === heroIdx ? 'active' : ''}`}
            >
              <img src={src} alt="Maison Vetu Collection" />
            </div>
          ))}
          <div className="hero-carousel-indicators">
            {heroImages.map((_, i) => (
              <span key={i} className={`indicator ${i === heroIdx ? 'active' : ''}`} onClick={() => setHeroIdx(i)}></span>
            ))}
          </div>
        </div>
      </section>

      {/* Asymmetric Collections Grid */}
      <section className="maison-section">
        <div className="container">
          <div className="maison-collections-grid">
            {/* Large Left */}
            <Link to="/shop?category=Women" className="maison-collection-card large">
              <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80" alt="Women" />
              <div className="maison-collection-overlay">
                <span className="maison-collection-title">WOMENSWEAR</span>
                <span className="maison-collection-link">SHOP NOW</span>
              </div>
            </Link>
            
            {/* Stacked Right */}
            <div className="maison-collections-stack">
              <Link to="/shop?category=Accessories" className="maison-collection-card small">
                <img src="https://images.unsplash.com/photo-1549439602-43ebca2327af?w=800&q=80" alt="Accessories" />
                <div className="maison-collection-overlay">
                  <span className="maison-collection-title">ACCESSORIES</span>
                  <span className="maison-collection-link">SHOP NOW</span>
                </div>
              </Link>
              <Link to="/shop?category=Men" className="maison-collection-card small">
                <img src="https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=800&q=80" alt="Mens" />
                <div className="maison-collection-overlay">
                  <span className="maison-collection-title">MENSWEAR</span>
                  <span className="maison-collection-link">SHOP NOW</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals with Tabs */}
      <section className="maison-section">
        <div className="container">
          <div className="maison-section-header centered">
            <h2 className="maison-section-title">NEW ARRIVALS</h2>
            <div className="maison-filter-tabs">
              {tabs.map(tab => (
                <button 
                  key={tab} 
                  className={`maison-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="maison-products-grid">
            {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '3/4', background: '#111' }} />)
              : filteredArrivals.length > 0 
                ? filteredArrivals.map(p => <ProductCard key={p._id} product={p} />)
                : <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)'}}>No products found in this category.</div>
            }
          </div>
          <div className="maison-section-footer">
            <Link to="/shop?newArrival=true" className="btn-outline">VIEW ALL</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
