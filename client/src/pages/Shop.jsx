import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import API from '../api';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  const activeCategory = categoryParam 
    ? categoryParam.replace(/-/g, ' ').toLowerCase() 
    : 'all';

  useEffect(() => {
    API.get('/products').then(res => {
      setProducts(res.data.products || res.data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleCategoryChange = (catName) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catName === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', catName.replace(/\s+/g, '-').toLowerCase());
    }
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setSortBy('newest');
  };

  // Derive categories dynamically from products
  const availableCategories = useMemo(() => {
    const set = new Set(['Drop Shoulder Tees', 'Baggy Trousers']);
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'all') {
      result = result.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        const act = activeCategory.toLowerCase();
        return cat.includes(act) || sub.includes(act) || act.includes(cat);
      });
    }

    // Search query filter
    if (searchParam.trim()) {
      const q = searchParam.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else {
      // Newest
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [products, activeCategory, searchParam, sortBy]);

  return (
    <div className="page-wrapper">
      <main className="main-content">
        <div className="container">
          <div className="shop-header" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div>
                <h1 className="h1" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '0.04em', margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>
                  {activeCategory === 'all' ? 'Collection' : activeCategory}
                </h1>
                {searchParam && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px', margin: 0 }}>
                    Showing results for "{searchParam}"
                  </p>
                )}
              </div>

              {/* Sorting & Item Count Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="shop-sort" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Sort by:
                  </label>
                  <select 
                    id="shop-sort"
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)}
                    className="form-input"
                    style={{ padding: '7px 12px', fontSize: '0.85rem', width: 'auto', borderRadius: '20px', cursor: 'pointer', background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Horizontal Category Filter Pills */}
            <div className="category-pills" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button 
                type="button"
                className={`category-pill ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('all')}
              >
                All
              </button>
              {availableCategories.map(cat => (
                <button 
                  key={cat}
                  type="button"
                  className={`category-pill ${activeCategory === cat.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
              {(activeCategory !== 'all' || searchParam) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  style={{ background: 'none', border: 'none', color: 'var(--gold, #c9a84c)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: '6px 10px', textDecoration: 'underline' }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="shop-products">
            <div className="products-grid">
              {loading ? (
                <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Loading products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>No products found matching your selection.</p>
                  <button type="button" onClick={handleClearFilters} className="btn-primary">
                    View All Products
                  </button>
                </div>
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
