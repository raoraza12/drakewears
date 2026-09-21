import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam.replace(/-/g, ' ').toLowerCase());
    }
  }, [categoryParam]);

  useEffect(() => {
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
    : products.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        const act = activeCategory.toLowerCase();
        return cat.includes(act) || sub.includes(act) || act.includes(cat);
      });

  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="container">
          <div className="shop-header" style={{ marginBottom: '32px' }}>
            <h1 className="h1" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '16px', color: '#ffffff', textTransform: 'uppercase' }}>
              Collection
            </h1>

            {/* Horizontal Category Filter Pills */}
            <div className="category-pills" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All
              </button>
              <button 
                className={`category-pill ${activeCategory.toLowerCase() === 'drop shoulder tees' ? 'active' : ''}`}
                onClick={() => setActiveCategory('drop shoulder tees')}
              >
                Drop Shoulder Tees
              </button>
              <button 
                className={`category-pill ${activeCategory.toLowerCase() === 'baggy trousers' ? 'active' : ''}`}
                onClick={() => setActiveCategory('baggy trousers')}
              >
                Baggy Trousers
              </button>
            </div>
          </div>

            {/* Product Grid */}
            <div className="shop-products">
              <div className="products-grid">
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
