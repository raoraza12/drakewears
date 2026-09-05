import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Shop = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    import('../api').then(module => {
      const API = module.default;
      API.get('/products').then(res => {
        setProducts(res.data.products || res.data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    });
  }, []);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory || p.type === activeCategory || p.category?.toLowerCase() === activeCategory?.toLowerCase());

  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="container">
          <div className="shop-header" style={{ marginBottom: '32px' }}>
            <h1 className="h1" style={{ fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '12px' }}>
              drakewears 2026 Collection
            </h1>

            {/* Horizontal Category Filter Pills matching screenshot #3 */}
            <div className="category-pills" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
              <button 
                className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '30px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeCategory === 'all' ? '#000000' : '#f4f4f5',
                  color: activeCategory === 'all' ? '#ffffff' : '#18181b',
                  transition: 'all 0.2s ease'
                }}
              >
                All
              </button>
              <button 
                className={`category-pill ${activeCategory.toLowerCase() === 'drop shoulder tees' ? 'active' : ''}`}
                onClick={() => setActiveCategory('drop shoulder tees')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '30px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeCategory.toLowerCase() === 'drop shoulder tees' ? '#000000' : '#f4f4f5',
                  color: activeCategory.toLowerCase() === 'drop shoulder tees' ? '#ffffff' : '#18181b',
                  transition: 'all 0.2s ease'
                }}
              >
                Drop Shoulder Tees
              </button>
              <button 
                className={`category-pill ${activeCategory.toLowerCase() === 'baggy trousers' ? 'active' : ''}`}
                onClick={() => setActiveCategory('baggy trousers')}
                style={{
                  padding: '10px 24px',
                  borderRadius: '30px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeCategory.toLowerCase() === 'baggy trousers' ? '#000000' : '#f4f4f5',
                  color: activeCategory.toLowerCase() === 'baggy trousers' ? '#ffffff' : '#18181b',
                  transition: 'all 0.2s ease'
                }}
              >
                Baggy Trousers
              </button>
            </div>
          </div>

            {/* Product Grid */}
            <div className="shop-products">
              <div className="products-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {loading ? (
                  <p>Loading products...</p>
                ) : filteredProducts.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  filteredProducts.map(product => (
                    <ProductCard key={product.id || product._id} product={product} />
                  ))
                )}
              </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default Shop;
