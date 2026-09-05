import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [popularProducts, setPopularProducts] = React.useState([]);

  React.useEffect(() => {
    import('../api').then(module => {
      const API = module.default;
      API.get('/products?sort=popular&limit=4').then(res => {
        setPopularProducts(res.data.products || res.data || []);
      }).catch(err => console.error(err));
    });
  }, []);
  return (
    <div className="page-wrapper">
      <main className="main-content" style={{ paddingTop: 0 }}>
        {/* Hero Section */}
        <section className="hero-section" style={{ position: 'relative', height: '100vh', minHeight: '600px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          
          <div className="hero-bg" style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
            <img 
              src="/carousel-1.jpg" 
              alt="drakewears Collection" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
          
          <div className="container hero-container" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
            <div className="hero-content animate-slide-up" style={{ textAlign: 'left', maxWidth: '600px' }}>
              <h1 className="h1" style={{ color: '#ffffff', fontWeight: 600, marginBottom: '24px', fontSize: 'clamp(3.5rem, 6vw, 6rem)', lineHeight: 1.1 }}>
                Collections<br/>2026©
              </h1>
              <div style={{ marginTop: '40px' }}>
                <Link to="/shop" className="btn-primary" style={{ backgroundColor: '#ffffff', color: 'var(--bg-dark)' }}>
                  Explore Collection
                </Link>
              </div>
            </div>
          </div>
        </section>


        {/* Categories Section */}
        <section className="categories-section reveal-on-scroll is-visible">
          <div className="container">
            <div className="categories-grid">
              <Link to="/shop?category=baggy-trousers" className="category-card image-zoom-container">
                <img 
                  src="https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1926&auto=format&fit=crop" 
                  alt="Baggy Trousers" 
                />
                <div className="category-content">
                  <h3 className="h3">Baggy Trousers</h3>
                  <span className="btn-icon">→</span>
                </div>
              </Link>
              <Link to="/shop?category=drop-shoulder-tees" className="category-card image-zoom-container">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1962&auto=format&fit=crop" 
                  alt="Drop Shoulder Tees" 
                />
                <div className="category-content">
                  <h3 className="h3">Drop Shoulder Tees</h3>
                  <span className="btn-icon">→</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="featured-section reveal-on-scroll is-visible">
          <div className="container">
            <div className="section-header">
              <h2 className="h2">Popular Products</h2>
              <Link to="/shop" className="btn-outline">View All</Link>
            </div>
            
            <div className="products-grid">
              {popularProducts.length === 0 ? (
                <p>Loading popular products...</p>
              ) : (
                popularProducts.map(product => (
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
