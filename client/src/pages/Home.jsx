import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiShield, FiPackage, FiAward, FiUnlock, FiLock, FiArrowRight } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import API from '../api';
import './Home.css';

const HERO_SLIDES = [
  {
    id: 0,
    image: '/carousel-newarrivals.jpg',
    ctaLink: '/shop?filter=new',
    alt: 'New Arrivals - DrakeWears Latest Drop',
  },
  {
    id: 1,
    image: '/carousel-gymwears.jpg',
    ctaLink: '/shop',
    alt: 'Gymwears - DrakeWears Performance Drop',
  },
  {
    id: 2,
    image: '/carousel-casualwears.jpg',
    ctaLink: '/shop?category=bottoms',
    alt: 'Casual Wears - DrakeWears Streetwear Collection',
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
  const [newArrivals, setNewArrivals] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Mobile Touch Swipe Handling
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const minSwipeDistance = 40;

  // Fetch popular products & newest arrivals
  useEffect(() => {
    API.get('/products?sort=popular&limit=4')
      .then(res => setPopularProducts(res.data.products || res.data || []))
      .catch(err => console.error(err));

    API.get('/products?sort=newest&limit=8')
      .then(res => setNewArrivals(res.data.products || res.data || []))
      .catch(err => console.error(err));
  }, []);

  // Auto-Advance Carousel every 3.5s (Pauses on hover / touch active)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isHovered]);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  // Touch handlers for fluid mobile swipe
  const handleTouchStart = (e) => {
    setIsHovered(true);
    setTouchEnd({ x: 0, y: 0 });
    if (e.targetTouches && e.targetTouches[0]) {
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.targetTouches && e.targetTouches[0]) {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (!touchStart.x || !touchEnd.x) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);
    // Ensure it was primarily a horizontal swipe, not vertical page scroll
    if (Math.abs(distanceX) > minSwipeDistance && distanceY < 100) {
      if (distanceX > 0) {
        nextSlide(); // Swiped left -> next
      } else {
        prevSlide(); // Swiped right -> prev
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  };

  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://drakewears.com/#organization',
        'name': 'DRAKEWEARS',
        'url': 'https://drakewears.com',
        'logo': 'https://drakewears.com/drakewears-logo.png',
        'description': 'Modern Luxury Streetwear, Baggy Trousers, Drop Shoulder Tees & Apparel brand in Pakistan.',
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+92-321-8254922',
          'contactType': 'Customer Service',
          'areaServed': 'PK',
          'availableLanguage': ['English', 'Urdu']
        },
        'sameAs': [
          'https://instagram.com/drakewears',
          'https://facebook.com/drakewears'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://drakewears.com/#website',
        'url': 'https://drakewears.com',
        'name': 'DRAKEWEARS',
        'description': 'Modern Luxury Streetwear & Apparel in Pakistan',
        'publisher': {
          '@id': 'https://drakewears.com/#organization'
        },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://drakewears.com/shop?search={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  };

  return (
    <div className="page-wrapper home-3d-page">
      <SEOHead
        title="DRAKEWEARS | Modern Luxury Streetwear & Apparel Pakistan"
        description="Discover luxury streetwear, oversized drop shoulder tees, baggy cargo trousers, and premium hoodies at DRAKEWEARS Pakistan. Free shipping on orders over Rs. 5,000."
        keywords="DRAKEWEARS, streetwear pakistan, drop shoulder tees, baggy trousers, oversized t shirts, luxury streetwear, pakistan streetwear brand"
        url="https://drakewears.com/"
        schema={homeSchema}
      />
      <h1 className="sr-only">DRAKEWEARS | Modern Luxury Streetwear & Apparel Pakistan</h1>
      <main className="main-content" style={{ paddingTop: 0 }}>
        
        {/* ==========================================================
            1. HERO: OUTFITTERS-STYLE CLEAN FULL-WIDTH CAROUSEL (IMAGES ONLY)
            ========================================================== */}
        <section 
          className="hero-otr-carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="region"
          aria-label="DrakeWears Featured Drops Carousel"
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
                  tabIndex={isActive ? 0 : -1}
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
                    draggable={false}
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
                aria-label={`Slide ${i + 1} of ${HERO_SLIDES.length}`}
              />
            ))}
          </div>

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
                to="/shop?category=bottoms" 
                className="category-card-3d scroll-reveal scroll-delay-1"
              >
                <div className="cat-card-img-box">
                  <img 
                    src="/home-category-baggy.jfif" 
                    onError={(e) => { e.currentTarget.src = '/home-page-category.jpg'; }}
                    alt="Bottoms" 
                  />
                  <div className="cat-card-glass-glow"></div>
                </div>
                <div className="cat-card-content">
                  <span className="cat-drop-tag">COLLECTION</span>
                  <h3 className="cat-title">Bottoms</h3>
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
                    src="/home-category-tees.png" 
                    alt="Drop Shoulder Tees" 
                    style={{ objectPosition: 'center 15%' }}
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
            3.5. THE DRAKE VAULT: 1-OF-1 CURATED ARCHIVE SPOTLIGHT
            ========================================================== */}
        <section className="home-vault-spotlight scroll-reveal">
          <div className="container">
            <div className="home-vault-card">
              <div className="home-vault-content">
                <div className="home-vault-badge-row">
                  <span className="home-vault-live-pill">
                    <span className="home-vault-live-dot"></span> ARCHIVE DROP
                  </span>
                  <span className="home-vault-tag-pill">STRICT 1-OF-1</span>
                </div>

                <h2 className="home-vault-title">THE DRAKE VAULT</h2>
                <p className="home-vault-slogan">
                  1-of-1 Curated Vintage &amp; Archive Pieces
                </p>

                <div className="home-vault-coming-soon-pill">
                  <FiLock size={14} className="coming-soon-lock-icon" />
                  <span>COMING SOON • DROP #01</span>
                </div>

                <div className="home-vault-action-row">
                  <Link to="/vault" className="home-vault-cta-btn">
                    <FiLock size={16} /> ENTER THE VAULT
                  </Link>
                  <Link to="/vault" className="home-vault-link-btn">
                    Explore Drops <FiArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="home-vault-visual">
                <div className="vault-visual-card">
                  <div className="vault-card-glow"></div>
                  <div className="vault-card-header">
                    <span className="vault-chip-pill">1 OF 1</span>
                    <span className="vault-chip-status">SEALED</span>
                  </div>
                  <div className="vault-card-center">
                    <div className="vault-lock-orb">
                      <FiLock size={32} />
                    </div>
                    <div className="vault-card-big-title">ARCHIVE GRAILS</div>
                    <div className="vault-card-drop-tag">DROP #01 • COMING SOON</div>
                  </div>
                  <div className="vault-card-footer">
                    <span>STATUS: PREPARING</span>
                    <span>STRICT EXCLUSIVITY</span>
                  </div>
                </div>
              </div>
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
            4.5. NEW ARRIVALS: FRESH DROPS (AUTO 10-DAY SPOTLIGHT)
            ========================================================== */}
        <section className="featured-section new-arrivals-home-section" style={{ borderTop: '1px solid var(--border-light)' }}>
          <div className="container">
            <div className="section-header scroll-reveal">
              <div>
                <span className="section-kicker" style={{ color: 'var(--gold, #c9a84c)', fontWeight: 800, letterSpacing: '0.12em' }}>⚡ JUST DROPPED</span>
                <h2 className="h2" style={{ marginTop: '4px' }}>New Arrivals</h2>
              </div>
              <Link to="/shop?filter=new" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Explore All New Drops <FiArrowRight size={14} />
              </Link>
            </div>
            
            <div className="products-grid scroll-reveal scroll-delay-1">
              {newArrivals.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading latest arrivals...</p>
              ) : (
                newArrivals.slice(0, 4).map((product) => (
                  <ProductCard key={product.id || product._id} product={product} />
                ))
              )}
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
                popularProducts.map((product) => (
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
