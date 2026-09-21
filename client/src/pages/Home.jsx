import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiLayers, FiShield, FiPackage, FiAward } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import './Home.css';

const HERO_SLIDES = [
  {
    id: 0,
    image: '/carousel-1.jpg',
    ctaLink: '/shop',
    alt: 'DrakeWears Atelier Drops',
  },
  {
    id: 1,
    image: '/carousel-2.jpg',
    ctaLink: '/shop?category=baggy-trousers',
    alt: 'DrakeWears Baggy Trousers & Hoodies',
  },
  {
    id: 2,
    image: 'https://res.cloudinary.com/rwmcd7gk/image/upload/v1787585429/drakewears_products/yborgrh3ixe2tt0ycxrp.jpg',
    ctaLink: '/shop?category=drop-shoulder-tees',
    alt: 'Drop Shoulder Oversized Tees',
  },
];

const ATELIER_SPECS = [
  {
    icon: <FiLayers size={22} />,
    title: '450 GSM Heavyweight',
    desc: 'Dense, structured fleece built to maintain shape and volume.',
    tag: 'PREMIUM FABRIC',
  },
  {
    icon: <FiPackage size={22} />,
    title: 'All Pakistan Delivery',
    desc: 'Cash on Delivery (COD) available nationwide across Pakistan.',
    tag: 'NATIONWIDE',
  },
  {
    icon: <FiAward size={22} />,
    title: 'Signature Baggy Fit',
    desc: 'Wide-leg streetwear cuts engineered for relaxed modern drape.',
    tag: 'CUSTOM CUTS',
  },
  {
    icon: <FiShield size={22} />,
    title: '7-Day Easy Exchange',
    desc: 'Hassle-free size & fit exchange. 100% genuine satisfaction.',
    tag: 'TRUST GUARANTEE',
  },
];

const Home = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch popular products
  useEffect(() => {
    import('../api').then(module => {
      const API = module.default;
      API.get('/products?sort=popular&limit=4')
        .then(res => setPopularProducts(res.data.products || res.data || []))
        .catch(err => console.error(err));
    });
  }, []);

  // Auto-Advance Carousel every 3.5s (Pauses on hover)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="page-wrapper home-3d-page">
      <main className="main-content" style={{ paddingTop: 0 }}>
        
        {/* ==========================================================
            1. HERO: OUTFITTERS-STYLE CLEAN FULL-WIDTH CAROUSEL (IMAGES ONLY)
            ========================================================== */}
        <section 
          className="hero-otr-carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="otr-carousel-viewport">
            {HERO_SLIDES.map((slide, index) => {
              const isActive = index === activeSlide;
              return (
                <Link
                  key={slide.id}
                  to={slide.ctaLink}
                  className={`otr-slide ${isActive ? 'active' : ''}`}
                  aria-label={slide.alt}
                >
                  <img 
                    src={slide.image} 
                    alt={slide.alt} 
                    className="otr-slide-img" 
                    onError={(e) => {
                      if (slide.image && slide.image.includes('.jfif')) {
                        e.currentTarget.src = '/home-page-category.jpg';
                      }
                    }}
                  />
                </Link>
              );
            })}
          </div>

          {/* Minimalist Outfitters Dots at Bottom Center */}
          <div className="otr-carousel-dots">
            {HERO_SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                className={`otr-dot ${i === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Clean Subtle Chevrons */}
          <button 
            className="otr-arrow otr-arrow-left" 
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <FiArrowLeft size={18} />
          </button>
          <button 
            className="otr-arrow otr-arrow-right" 
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <FiArrowRight size={18} />
          </button>
        </section>

        {/* ==========================================================
            2. LUXURY 3D MONOCHROME MARQUEE TICKER
            ========================================================== */}
        <section className="marquee-3d-section">
          <div className="marquee-3d-track">
            <div className="marquee-3d-group">
              <span>DRAKEWEARS • ATELIER CUTS</span>
              <span className="marquee-divider">/</span>
              <span>HEAVYWEIGHT 450 GSM</span>
              <span className="marquee-divider">/</span>
              <span>BAGGY STREETWEAR FIT</span>
              <span className="marquee-divider">/</span>
              <span>LIMITED QUANTITIES</span>
              <span className="marquee-divider">/</span>
              <span>ZERO COMPROMISE</span>
              <span className="marquee-divider">/</span>
            </div>
            <div className="marquee-3d-group" aria-hidden="true">
              <span>DRAKEWEARS • ATELIER CUTS</span>
              <span className="marquee-divider">/</span>
              <span>HEAVYWEIGHT 450 GSM</span>
              <span className="marquee-divider">/</span>
              <span>BAGGY STREETWEAR FIT</span>
              <span className="marquee-divider">/</span>
              <span>LIMITED QUANTITIES</span>
              <span className="marquee-divider">/</span>
              <span>ZERO COMPROMISE</span>
              <span className="marquee-divider">/</span>
            </div>
          </div>
        </section>

        {/* ==========================================================
            3. CATEGORIES: 3D HOLOGRAPHIC TILES
            ========================================================== */}
        <section className="categories-3d-section">
          <div className="container">
            <div className="section-title-wrap scroll-reveal">
              <span className="section-kicker">COLLECTIONS</span>
              <h2 className="section-main-title">Shop by Category</h2>
            </div>

            <div className="categories-3d-grid">
              <Link 
                to="/shop?category=baggy-trousers" 
                className="category-card-3d scroll-reveal scroll-delay-1"
              >
                <div className="cat-card-img-box">
                  <img 
                    src="/home-category-baggy.jfif" 
                    onError={(e) => { e.currentTarget.src = '/home-page-category.jpg'; }}
                    alt="Baggy Trousers" 
                  />
                  <div className="cat-card-glass-glow"></div>
                </div>
                <div className="cat-card-content">
                  <span className="cat-drop-tag">BOTTOMS</span>
                  <h3 className="cat-title">Baggy Trousers</h3>
                  <div className="cat-action-row">
                    <span className="cat-cta-text">Shop Now</span>
                    <span className="cat-arrow-circle">→</span>
                  </div>
                </div>
              </Link>

              <Link 
                to="/shop?category=drop-shoulder-tees" 
                className="category-card-3d scroll-reveal scroll-delay-2"
              >
                <div className="cat-card-img-box">
                  <img 
                    src="https://res.cloudinary.com/rwmcd7gk/image/upload/v1787585429/drakewears_products/yborgrh3ixe2tt0ycxrp.jpg" 
                    alt="Drop Shoulder Tees" 
                  />
                  <div className="cat-card-glass-glow"></div>
                </div>
                <div className="cat-card-content">
                  <span className="cat-drop-tag">TOPS</span>
                  <h3 className="cat-title">Drop Shoulder Tees</h3>
                  <div className="cat-action-row">
                    <span className="cat-cta-text">Shop Now</span>
                    <span className="cat-arrow-circle">→</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* ==========================================================
            4. TRUST STANDARDS (MINIMAL PUNCHY PILLARS)
            ========================================================== */}
        <section className="atelier-specs-3d-section">
          <div className="container">
            <div className="section-title-wrap text-center scroll-reveal">
              <span className="section-kicker">WHY DRAKEWEARS</span>
              <h2 className="section-main-title">The Streetwear Standard</h2>
            </div>

            <div className="specs-3d-grid">
              {ATELIER_SPECS.map((spec, idx) => (
                <div key={idx} className={`spec-card-3d scroll-reveal scroll-delay-${(idx % 4) + 1}`}>
                  <div className="spec-card-top">
                    <div className="spec-icon-box">{spec.icon}</div>
                    <span className="spec-tag-pill">{spec.tag}</span>
                  </div>
                  <h4 className="spec-card-title">{spec.title}</h4>
                  <p className="spec-card-desc">{spec.desc}</p>
                  <div className="spec-card-bottom-line"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================
            5. FEATURED PRODUCTS: 3D GYRO CARDS
            ========================================================== */}
        <section className="featured-section">
          <div className="container">
            <div className="section-header scroll-reveal">
              <div>
                <span className="section-kicker">AVAILABLE NOW</span>
                <h2 className="h2" style={{ marginTop: '4px' }}>Popular Drops</h2>
              </div>
              <Link to="/shop" className="btn-outline">
                View Full Catalog →
              </Link>
            </div>
            
            <div className="products-grid scroll-reveal scroll-delay-1">
              {popularProducts.length === 0 ? (
                <p style={{ color: '#71717a' }}>Loading popular products...</p>
              ) : (
                popularProducts.map((product, pIdx) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;
