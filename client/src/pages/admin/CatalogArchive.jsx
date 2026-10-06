import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiDatabase, FiDownload, FiSearch, FiLayers, 
  FiBox, FiCheckCircle, FiXCircle, FiExternalLink, 
  FiEye, FiPrinter, FiRefreshCw, FiX, FiShield,
  FiMaximize2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../api';
import './CatalogArchive.css';

export default function CatalogArchive() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  
  // Selected product for the spacious ("khula khula") popup modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Large image preview modal (Lightbox)
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    fetchArchive();
  }, []);

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products?limit=1000');
      const list = res.data?.products || res.data || [];
      setProducts(list);
    } catch (err) {
      console.error('Failed to load archive products:', err);
      toast.error('Failed to load catalog archive');
    } finally {
      setLoading(false);
    }
  };

  // Discover all unique categories
  const categoriesList = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.category && typeof p.category === 'string') {
        set.add(p.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [products]);

  // Normalized Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const name = (p.name || '').toLowerCase();
        const slug = (p.slug || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';
        const sizes = Array.isArray(p.sizes) ? p.sizes.join(' ').toLowerCase() : '';
        
        let colorStr = '';
        if (Array.isArray(p.colors)) {
          colorStr = p.colors.map(c => typeof c === 'string' ? c : (c.name || '')).join(' ').toLowerCase();
        }

        return name.includes(q) || slug.includes(q) || cat.includes(q) || 
               sub.includes(q) || desc.includes(q) || tags.includes(q) || 
               sizes.includes(q) || colorStr.includes(q);
      });
    }

    // 2. Category Filter
    if (categoryFilter !== 'ALL') {
      result = result.filter(p => (p.category || '').toLowerCase().trim() === categoryFilter.toLowerCase().trim());
    }

    // 3. Stock Status Filter
    if (stockFilter === 'IN_STOCK') {
      result = result.filter(p => (Number(p.stock) || 0) > 5);
    } else if (stockFilter === 'LOW_STOCK') {
      result = result.filter(p => {
        const s = Number(p.stock) || 0;
        return s > 0 && s <= 5;
      });
    } else if (stockFilter === 'OUT_OF_STOCK') {
      result = result.filter(p => (Number(p.stock) || 0) <= 0);
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'stock-high') return (Number(b.stock) || 0) - (Number(a.stock) || 0);
      if (sortBy === 'stock-low') return (Number(a.stock) || 0) - (Number(b.stock) || 0);
      return 0;
    });

    return result;
  }, [products, searchQuery, categoryFilter, stockFilter, sortBy]);

  // Export JSON Backup
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(filteredProducts, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `drakewears_products_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filteredProducts.length} products to JSON! 📁`);
    } catch (err) {
      console.error('Export JSON error:', err);
      toast.error('Failed to export JSON file');
    }
  };

  // Export CSV / Excel Ready File
  const handleExportCSV = () => {
    try {
      const headers = [
        'ID',
        'Name',
        'Slug',
        'Category',
        'Subcategory',
        'Price (PKR)',
        'Compare Price (PKR)',
        'Stock Qty',
        'Sizes',
        'Colors',
        'Images Count',
        'Primary Image URL',
        'All Image URLs',
        'Description',
        'Rating',
        'Num Reviews',
        'Created At'
      ];

      const rows = filteredProducts.map(p => {
        const sizesStr = Array.isArray(p.sizes) ? p.sizes.join('; ') : '';
        let colorsStr = '';
        if (Array.isArray(p.colors)) {
          colorsStr = p.colors.map(c => typeof c === 'string' ? c : `${c.name || 'Color'} (${c.hex || '#000'})`).join('; ');
        }
        const imagesList = Array.isArray(p.images) ? p.images : [];
        const primaryImg = imagesList[0] || '';
        const allImgsStr = imagesList.join(' | ');
        const cleanDesc = (p.description || '').replace(/"/g, '""').replace(/\r?\n|\r/g, ' ');

        return [
          `"${p.id || ''}"`,
          `"${(p.name || '').replace(/"/g, '""')}"`,
          `"${p.slug || ''}"`,
          `"${p.category || ''}"`,
          `"${p.subcategory || ''}"`,
          Number(p.price) || 0,
          Number(p.comparePrice) || 0,
          Number(p.stock) || 0,
          `"${sizesStr}"`,
          `"${colorsStr}"`,
          imagesList.length,
          `"${primaryImg}"`,
          `"${allImgsStr}"`,
          `"${cleanDesc}"`,
          Number(p.rating) || 0,
          Number(p.numReviews) || 0,
          `"${p.createdAt ? new Date(p.createdAt).toISOString() : ''}"`
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `drakewears_master_catalog_sheet_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${filteredProducts.length} products to Excel CSV! 📊`);
    } catch (err) {
      console.error('Export CSV error:', err);
      toast.error('Failed to export CSV file');
    }
  };

  // Helper to trigger direct image download to local drive
  const triggerImageDownload = async (imgUrl, suggestedName = 'drakewears-image.jpg') => {
    let toastId = null;
    try {
      toastId = toast.loading('Downloading image...');
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = suggestedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      if (toastId) toast.success('Image saved to downloads! 💾', { id: toastId });
    } catch {
      // Fallback for cross-origin if direct fetch is blocked
      window.open(imgUrl, '_blank');
      if (toastId) toast.dismiss(toastId);
      toast.success('Opened high-resolution image in new tab');
    }
  };

  // Download all images of the selected product
  const handleDownloadAllImages = async (product) => {
    const images = Array.isArray(product?.images) ? product.images : [];
    if (images.length === 0) {
      toast.error('No images available for this product');
      return;
    }

    toast.loading(`Saving ${images.length} images...`, { id: 'all-img-dl' });
    let count = 0;
    for (let i = 0; i < images.length; i++) {
      const cleanSlug = (product.slug || 'product').replace(/[^a-z0-9_-]/gi, '_');
      const filename = `${cleanSlug}_view_${i + 1}.jpg`;
      try {
        await triggerImageDownload(images[i], filename);
        count++;
      } catch {
        window.open(images[i], '_blank');
      }
    }
    toast.success(`Processed all ${count} images! 📁`, { id: 'all-img-dl' });
  };

  return (
    <div className="catalog-archive-page">
      {/* Header & Security Badge */}
      <div className="archive-header-wrap">
        <div className="archive-title-group">
          <h1>
            <FiDatabase color="#0e0e0e" /> Master Product Catalog &amp; Archive
          </h1>
          <p>
            Saved collection of all brand products with high-resolution assets, variants, and one-click export tools.
          </p>
        </div>

        <div className="security-badge" title="Access is strictly restricted to authenticated administrators">
          <FiShield size={16} />
          <span>Admin-Only Protected &bull; 100% Encrypted</span>
        </div>
      </div>

      {/* KPI Overview: Exactly TWO boxes (User requested removing the 2 middle analysis boxes) */}
      <div className="archive-kpi-grid">
        <div className="archive-kpi-card">
          <div className="kpi-icon-wrap"><FiBox /></div>
          <div className="kpi-info-wrap">
            <div className="kpi-label">Total Catalog Products</div>
            <div className="kpi-value">{products.length}</div>
            <div className="kpi-subtext">Active items in catalog</div>
          </div>
        </div>

        <div className="archive-kpi-card">
          <div className="kpi-icon-wrap"><FiLayers /></div>
          <div className="kpi-info-wrap">
            <div className="kpi-label">Active Collections</div>
            <div className="kpi-value">{categoriesList.length}</div>
            <div className="kpi-subtext">{categoriesList.join(', ')}</div>
          </div>
        </div>
      </div>

      {/* Action Bar: High-contrast, clean theme */}
      <div className="archive-actions-bar">
        <div>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0e0e0e', display: 'block' }}>
            Data Preservation &amp; Export
          </span>
          <span style={{ fontSize: '0.82rem', color: '#555555' }}>
            Download complete sorted products and images dataset directly to your device.
          </span>
        </div>

        <div className="export-btn-group">
          <button 
            type="button" 
            className="btn-archive-action primary" 
            onClick={handleExportCSV}
            title="Download formatted spreadsheet for Excel or Google Sheets"
          >
            <FiDownload /> Download Excel / CSV Sheet
          </button>

          <button 
            type="button" 
            className="btn-archive-action" 
            onClick={handleExportJSON}
            title="Download complete raw JSON data backup"
          >
            <FiDatabase /> Download JSON Archive
          </button>

          <button 
            type="button" 
            className="btn-archive-action" 
            onClick={() => window.print()}
            title="Print master sheet or save as PDF"
          >
            <FiPrinter /> Print / PDF
          </button>

          <button 
            type="button" 
            className="btn-archive-action" 
            onClick={fetchArchive}
            title="Reload latest catalog from database"
          >
            <FiRefreshCw className={loading ? 'spin' : ''} /> Reload
          </button>
        </div>
      </div>

      {/* Filters & Sorting Controls */}
      <div className="archive-filter-row">
        <div className="archive-search-box">
          <FiSearch className="search-icon" size={17} />
          <input 
            type="text" 
            placeholder="Search products by name, slug, tag, color, size..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
          className="archive-select"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          aria-label="Filter by Category"
        >
          <option value="ALL">All Categories ({products.length})</option>
          {categoriesList.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select 
          className="archive-select"
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value)}
          aria-label="Filter by Stock Status"
        >
          <option value="ALL">All Stock Levels</option>
          <option value="IN_STOCK">In Stock (&gt; 5 units)</option>
          <option value="LOW_STOCK">Low Stock (1 - 5 units)</option>
          <option value="OUT_OF_STOCK">Out of Stock (0 units)</option>
        </select>

        <select 
          className="archive-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          aria-label="Sort Order"
        >
          <option value="newest">Sort: Newest Added</option>
          <option value="oldest">Sort: Oldest Added</option>
          <option value="name-asc">Sort: Name (A &rarr; Z)</option>
          <option value="name-desc">Sort: Name (Z &rarr; A)</option>
          <option value="price-high">Sort: Price (High &rarr; Low)</option>
          <option value="price-low">Sort: Price (Low &rarr; High)</option>
          <option value="stock-high">Sort: Stock (High &rarr; Low)</option>
          <option value="stock-low">Sort: Stock (Low &rarr; High)</option>
        </select>
      </div>

      {/* Master Products Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#555555' }}>
          <FiRefreshCw className="spin" size={32} style={{ marginBottom: 16, color: '#0e0e0e' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Master Product Archive...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)' }}>
          <FiBox size={44} color="#71717a" style={{ marginBottom: 12 }} />
          <h3 style={{ color: '#0e0e0e', fontSize: '1.2rem', margin: '0 0 6px' }}>No products match your filters</h3>
          <p style={{ color: '#555555', fontSize: '0.88rem' }}>Try clearing your search query or choosing another category.</p>
          <button 
            type="button" 
            className="btn-archive-action" 
            style={{ marginTop: 16 }}
            onClick={() => { setSearchQuery(''); setCategoryFilter('ALL'); setStockFilter('ALL'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product &amp; Images</th>
                <th>Category</th>
                <th>Pricing</th>
                <th>Stock Units</th>
                <th>Sizes</th>
                <th>Colors</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, index) => {
                const stockNum = Number(p.stock) || 0;
                const priceNum = Number(p.price) || 0;
                const compareNum = Number(p.comparePrice) || 0;
                const images = Array.isArray(p.images) ? p.images : [];
                const mainImg = images[0] || '/carousel-casualwears.jpg';
                const sizes = Array.isArray(p.sizes) ? p.sizes : [];
                
                let colors = [];
                if (Array.isArray(p.colors)) {
                  colors = p.colors.map(c => typeof c === 'string' ? { name: c, hex: '#000' } : c);
                }

                let stockClass = 'in-stock';
                let stockText = `${stockNum} In Stock`;
                if (stockNum <= 0) {
                  stockClass = 'out-of-stock';
                  stockText = 'Out of Stock';
                } else if (stockNum <= 5) {
                  stockClass = 'low-stock';
                  stockText = `${stockNum} Low Stock`;
                }

                return (
                  <tr 
                    key={p.id || p.slug || index} 
                    className="archive-table-row"
                    onClick={() => setSelectedProduct(p)}
                    title="Click to open full product details and images popup"
                  >
                    <td style={{ color: '#71717a', fontWeight: 600, fontSize: '0.8rem' }}>
                      {index + 1}
                    </td>

                    {/* Product & Image Thumb */}
                    <td>
                      <div className="product-cell-wrap">
                        <div 
                          className="thumb-preview-box"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(p);
                          }}
                        >
                          <img 
                            src={mainImg} 
                            alt={p.name} 
                            loading="lazy"
                            onError={e => { e.currentTarget.src = '/carousel-casualwears.jpg'; }} 
                          />
                          {images.length > 1 && (
                            <span className="gallery-count-pill">{images.length} imgs</span>
                          )}
                        </div>

                        <div className="product-meta-block">
                          <h4 className="prod-name">{p.name}</h4>
                          <p className="prod-slug">/{p.slug || p.id}</p>
                          <a 
                            href={`/shop/${p.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="store-link-chip"
                            onClick={e => e.stopPropagation()}
                          >
                            <FiExternalLink size={12} /> View on Website
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="category-pill">{p.category || 'General'}</span>
                      {p.subcategory && (
                        <div style={{ fontSize: '0.74rem', color: '#71717a', marginTop: 4 }}>
                          {p.subcategory}
                        </div>
                      )}
                    </td>

                    {/* Pricing */}
                    <td>
                      <div className="price-cell-wrap">
                        <span className="current-price">Rs. {priceNum.toLocaleString()}</span>
                        {compareNum > 0 && (
                          <span className="compare-price">Rs. {compareNum.toLocaleString()}</span>
                        )}
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td>
                      <span className={`stock-badge-pill ${stockClass}`}>
                        {stockNum > 0 && <FiCheckCircle size={13} />}
                        {stockNum <= 0 && <FiXCircle size={13} />}
                        {stockText}
                      </span>
                    </td>

                    {/* Sizes */}
                    <td>
                      <div className="sizes-badge-group">
                        {sizes.length > 0 ? (
                          sizes.map(s => <span key={s} className="size-pill">{s}</span>)
                        ) : (
                          <span style={{ color: '#71717a', fontSize: '0.78rem' }}>-</span>
                        )}
                      </div>
                    </td>

                    {/* Colors */}
                    <td>
                      <div className="swatch-group">
                        {colors.length > 0 ? (
                          colors.map((c, i) => (
                            <span 
                              key={i} 
                              className="color-swatch-circle"
                              style={{ backgroundColor: c.hex || '#000000' }}
                              title={`${c.name || 'Color'} (${c.hex || '#000'})`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (c.image) setLightboxImg(c.image);
                              }}
                            />
                          ))
                        ) : (
                          <span style={{ color: '#71717a', fontSize: '0.78rem' }}>-</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <button 
                        type="button" 
                        className="btn-archive-action"
                        style={{ padding: '7px 14px', fontSize: '0.82rem', borderColor: '#0e0e0e' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(p);
                        }}
                      >
                        <FiEye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==========================================================================
          SPACIOUS ("KHULA KHULA") PRODUCT POPUP MODAL
          ========================================================================== */}
      {selectedProduct && (
        <div className="archive-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="archive-modal-container" onClick={e => e.stopPropagation()}>
            {/* Modal Sticky Header */}
            <div className="archive-modal-header">
              <div className="modal-header-left">
                <h2>{selectedProduct.name}</h2>
                <div className="modal-header-chips">
                  <span className="category-pill">{selectedProduct.category || 'General'}</span>
                  {selectedProduct.subcategory && <span className="category-pill">{selectedProduct.subcategory}</span>}
                  <a 
                    href={`/shop/${selectedProduct.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="store-link-chip"
                  >
                    <FiExternalLink size={13} /> View on Website
                  </a>
                </div>
              </div>
              <button 
                type="button" 
                className="archive-modal-close" 
                onClick={() => setSelectedProduct(null)}
                aria-label="Close Popup"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="archive-modal-body">
              {/* SECTION 1: ALL IMAGES & DOWNLOAD CONTROLS (User's specific wish) */}
              <div className="modal-section-card">
                <div className="modal-section-header">
                  <h3 className="modal-section-title">
                    <FiBox size={18} /> High-Resolution Product Images ({Array.isArray(selectedProduct.images) ? selectedProduct.images.length : 0})
                  </h3>
                  
                  {Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 && (
                    <button 
                      type="button" 
                      className="btn-archive-action primary"
                      style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                      onClick={() => handleDownloadAllImages(selectedProduct)}
                    >
                      <FiDownload /> Download All Images ({selectedProduct.images.length})
                    </button>
                  )}
                </div>

                <div className="modal-gallery-grid">
                  {Array.isArray(selectedProduct.images) && selectedProduct.images.map((imgUrl, i) => {
                    const cleanSlug = (selectedProduct.slug || 'product').replace(/[^a-z0-9_-]/gi, '_');
                    const filename = `${cleanSlug}_view_${i + 1}.jpg`;

                    return (
                      <div key={i} className="modal-img-card">
                        <div 
                          className="modal-img-thumb-wrap"
                          onClick={() => setLightboxImg(imgUrl)}
                          title="Click to view large preview"
                        >
                          <img src={imgUrl} alt={`${selectedProduct.name} view ${i + 1}`} />
                        </div>
                        <div className="modal-img-card-footer">
                          <button 
                            type="button" 
                            className="btn-img-action"
                            onClick={() => triggerImageDownload(imgUrl, filename)}
                            title="Save this image to your computer"
                          >
                            <FiDownload size={13} /> Save Image
                          </button>
                          <button 
                            type="button" 
                            className="btn-img-action"
                            style={{ flex: 'none', padding: '6px 10px' }}
                            onClick={() => setLightboxImg(imgUrl)}
                            title="View Full Size"
                          >
                            <FiMaximize2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: SPATIAL ("KHULA KHULA") PRODUCT SPECIFICATIONS */}
              <div className="modal-section-card">
                <h3 className="modal-section-title" style={{ marginBottom: 16 }}>
                  Product Specifications &amp; Pricing
                </h3>

                <div className="modal-specs-grid">
                  <div className="modal-spec-box">
                    <span className="modal-spec-label">Retail Selling Price</span>
                    <p className="modal-spec-val" style={{ color: '#0e0e0e', fontSize: '1.25rem' }}>
                      Rs. {(Number(selectedProduct.price) || 0).toLocaleString()}
                    </p>
                  </div>

                  {Number(selectedProduct.comparePrice) > 0 && (
                    <div className="modal-spec-box">
                      <span className="modal-spec-label">Compare / Original Price</span>
                      <p className="modal-spec-val" style={{ textDecoration: 'line-through', color: '#71717a' }}>
                        Rs. {(Number(selectedProduct.comparePrice) || 0).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="modal-spec-box">
                    <span className="modal-spec-label">Inventory Stock</span>
                    <p className="modal-spec-val" style={{ color: Number(selectedProduct.stock) > 0 ? '#16a34a' : '#dc2626' }}>
                      {selectedProduct.stock || 0} Units Available
                    </p>
                  </div>

                  <div className="modal-spec-box">
                    <span className="modal-spec-label">Available Sizes</span>
                    <p className="modal-spec-val">
                      {Array.isArray(selectedProduct.sizes) && selectedProduct.sizes.length > 0 
                        ? selectedProduct.sizes.join(', ') 
                        : 'Standard (All sizes)'}
                    </p>
                  </div>

                  <div className="modal-spec-box">
                    <span className="modal-spec-label">Color Variants</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                      {Array.isArray(selectedProduct.colors) && selectedProduct.colors.length > 0 ? (
                        selectedProduct.colors.map((c, idx) => {
                          const name = typeof c === 'string' ? c : (c.name || 'Color');
                          const hex = typeof c === 'object' ? (c.hex || '#000') : '#000';
                          return (
                            <span 
                              key={idx} 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: 6, 
                                background: '#f4f4f6', 
                                padding: '3px 8px', 
                                borderRadius: 6, 
                                fontSize: '0.8rem',
                                border: '1px solid rgba(0,0,0,0.08)'
                              }}
                            >
                              <span style={{ width: 14, height: 14, borderRadius: '50%', background: hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                              {name}
                            </span>
                          );
                        })
                      ) : (
                        <span>Default Color</span>
                      )}
                    </div>
                  </div>

                  <div className="modal-spec-box">
                    <span className="modal-spec-label">Product Slug</span>
                    <p className="modal-spec-val" style={{ fontSize: '0.88rem', fontFamily: 'monospace' }}>
                      {selectedProduct.slug}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="modal-desc-box">
                  <span className="modal-spec-label" style={{ marginBottom: 8 }}>
                    Full Product Description
                  </span>
                  <p>
                    {selectedProduct.description || 'No detailed description added for this product.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          LARGE IMAGE PREVIEW LIGHTBOX
          ========================================================================== */}
      {lightboxImg && (
        <div className="archive-modal-overlay" onClick={() => setLightboxImg(null)} style={{ zIndex: 1300 }}>
          <div style={{ maxWidth: 850, width: '92%', maxHeight: '90vh', position: 'relative', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <button 
              type="button" 
              className="archive-modal-close" 
              style={{ position: 'absolute', top: -16, right: -16, zIndex: 10, background: '#ffffff', border: '1px solid rgba(0,0,0,0.2)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
              onClick={() => setLightboxImg(null)}
            >
              <FiX size={20} />
            </button>
            <img 
              src={lightboxImg} 
              alt="High resolution preview" 
              style={{ maxWidth: '100%', maxHeight: '82vh', borderRadius: 12, objectFit: 'contain', background: '#000', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }} 
            />
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button 
                type="button" 
                className="btn-archive-action primary" 
                onClick={() => triggerImageDownload(lightboxImg, 'drakewears_full_image.jpg')}
              >
                <FiDownload /> Download High-Res Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
