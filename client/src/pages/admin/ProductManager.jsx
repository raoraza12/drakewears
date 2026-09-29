import React, { useState, useEffect, useMemo } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiList, FiTrash2, FiArrowLeft, FiImage, FiUploadCloud, 
  FiArrowUp, FiArrowDown, FiSearch, FiLayers, FiChevronDown, 
  FiChevronUp, FiX, FiCheck, FiFolderPlus, FiBox 
} from 'react-icons/fi';

const DEFAULT_CATEGORIES = ['Baggy Trousers', 'Drop Shoulder Tees', 'Drake Vault'];

const loadStoredCategories = () => {
  try {
    const raw = localStorage.getItem('drakewears_admin_categories');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const names = parsed
          .map(c => (typeof c === 'string' ? c.trim() : c.name?.trim()))
          .filter(Boolean);
        if (names.length > 0) {
          return Array.from(new Set([...DEFAULT_CATEGORIES, ...names]));
        }
      }
    }
  } catch (err) {
    console.error('Error loading stored categories:', err);
  }
  return DEFAULT_CATEGORIES;
};

const syncCategoriesToStorage = (cats) => {
  try {
    const existingRaw = localStorage.getItem('drakewears_admin_categories');
    let existingList = [];
    if (existingRaw) {
      try {
        existingList = JSON.parse(existingRaw);
      } catch {
        existingList = [];
      }
    }
    const existingMap = new Map();
    if (Array.isArray(existingList)) {
      existingList.forEach(item => {
        const name = typeof item === 'string' ? item : item.name;
        if (name) existingMap.set(name.toLowerCase().trim(), item);
      });
    }

    const finalList = cats.map(cat => {
      const found = existingMap.get(cat.toLowerCase().trim());
      if (found && typeof found === 'object') return found;
      return { 
        id: 'cat-' + cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'), 
        name: cat, 
        status: 'Active' 
      };
    });

    localStorage.setItem('drakewears_admin_categories', JSON.stringify(finalList));
  } catch (err) {
    console.error('Error syncing categories to storage:', err);
  }
};

const ProductManager = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
  const [editingId, setEditingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Category & Filter States
  const [categories, setCategories] = useState(loadStoredCategories);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    colors: '',
  });
  const [showInlineAddCat, setShowInlineAddCat] = useState(false);
  const [inlineCatInput, setInlineCatInput] = useState('');

  // Dynamic Gallery Items: [{ id, url, file, preview }]
  const [galleryItems, setGalleryItems] = useState([
    { id: 'img-1', url: '', file: null, preview: '' }
  ]);
  const [uploading, setUploading] = useState(false);
  const [colorItems, setColorItems] = useState([{ name: '', hex: '#000000', image: '', file: null, preview: '' }]);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products?limit=1000');
      const fetchedProducts = res.data.products || res.data || [];
      setProducts(fetchedProducts);

      // Auto-discover any new categories found directly on products
      const dbCategories = fetchedProducts
        .map(p => p.category?.trim())
        .filter(Boolean);

      setCategories(prev => {
        const merged = Array.from(new Set([...prev, ...dbCategories]));
        syncCategoriesToStorage(merged);
        return merged;
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await API.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      setProducts(products.filter(p => p.id !== id && p._id !== id));
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id || product._id);
    const prodCategory = product.category || '';
    
    // Ensure product's category exists in categories state
    if (prodCategory && !categories.some(c => c.toLowerCase() === prodCategory.toLowerCase())) {
      const updated = [...categories, prodCategory];
      setCategories(updated);
      syncCategoriesToStorage(updated);
    }

    setFormData({
      name: product.name,
      price: product.price,
      category: prodCategory,
      colors: product.colors?.map(c => c.name).join(', ') || ''
    });

    setColorItems(product.colors?.length ? product.colors.map(c => ({ 
      name: c.name || '', 
      hex: c.hex || '#000000', 
      image: c.image || '',
      file: null,
      preview: c.image || ''
    })) : [{ name: '', hex: '#000000', image: '', file: null, preview: '' }]);
    
    // Populate dynamic gallery with existing product images
    if (product.images && product.images.length > 0) {
      setGalleryItems(product.images.map((imgUrl, idx) => ({
        id: `existing-${idx}-${Date.now()}`,
        url: imgUrl,
        file: null,
        preview: imgUrl
      })));
    } else {
      setGalleryItems([{ id: 'img-1', url: '', file: null, preview: '' }]);
    }
    setActiveTab('add');
    setShowInlineAddCat(false);
  };

  const handleAddProductForCategory = (catName) => {
    setEditingId(null);
    setFormData({
      name: '',
      price: '',
      category: catName,
      colors: ''
    });
    setColorItems([{ name: '', hex: '#000000', image: '', file: null, preview: '' }]);
    setGalleryItems([{ id: 'img-1', url: '', file: null, preview: '' }]);
    setShowInlineAddCat(false);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      let autoCategory = formData.category;
      if (!autoCategory) {
        if (value.toLowerCase().includes('trouser') || value.toLowerCase().includes('pant')) {
          autoCategory = 'Baggy Trousers';
        } else if (value.toLowerCase().includes('tee') || value.toLowerCase().includes('shirt')) {
          autoCategory = 'Drop Shoulder Tees';
        }
      }
      setFormData({ ...formData, [name]: value, category: autoCategory });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Add a new Category
  const handleCreateCategory = (catName) => {
    const trimmed = catName.trim();
    if (!trimmed) {
      toast.error('Please enter a valid category name.');
      return false;
    }
    const exists = categories.some(c => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      toast('Category already exists!', { icon: 'ℹ️' });
      setFormData(prev => ({ ...prev, category: trimmed }));
      return true;
    }

    const updated = [...categories, trimmed];
    setCategories(updated);
    syncCategoriesToStorage(updated);
    setFormData(prev => ({ ...prev, category: trimmed }));
    toast.success(`Category "${trimmed}" created! Section added.`);
    return true;
  };

  const toggleCategoryCollapse = (catName) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  // Add multiple files from device
  const handleMultipleGalleryFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newItems = files.map(file => ({
      id: 'file-' + Math.random().toString(36).substring(2, 9),
      url: '',
      file: file,
      preview: URL.createObjectURL(file)
    }));
    setGalleryItems(prev => {
      const filtered = prev.filter(it => it.url?.trim() || it.file);
      return [...filtered, ...newItems];
    });
    e.target.value = '';
  };

  // Add individual empty slot
  const handleAddGallerySlot = () => {
    setGalleryItems(prev => [...prev, { id: 'slot-' + Date.now(), url: '', file: null, preview: '' }]);
  };

  // Remove a gallery item
  const handleRemoveGalleryItem = (index) => {
    setGalleryItems(prev => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed?.preview && removed?.file) {
        URL.revokeObjectURL(removed.preview);
      }
      return copy.length > 0 ? copy : [{ id: 'empty-1', url: '', file: null, preview: '' }];
    });
  };

  // Update gallery item URL
  const handleUpdateGalleryUrl = (index, url) => {
    setGalleryItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], url, file: null, preview: url };
      return copy;
    });
  };

  // Update gallery item file
  const handleUpdateGalleryFile = (index, file) => {
    if (!file) return;
    setGalleryItems(prev => {
      const copy = [...prev];
      copy[index] = { 
        ...copy[index], 
        file, 
        url: '', 
        preview: URL.createObjectURL(file) 
      };
      return copy;
    });
  };

  // Move gallery item up / down in order
  const handleMoveGalleryItem = (index, direction) => {
    setGalleryItems(prev => {
      const copy = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required.');
      return;
    }
    if (!formData.category?.trim()) {
      toast.error('Please select or create a category.');
      return;
    }

    const validGallery = galleryItems.filter(it => it.url?.trim() || it.file);
    if (validGallery.length === 0) {
      toast.error('Please add at least one product image (upload a file or paste a URL).');
      return;
    }

    setUploading(true);

    try {
      // 1. Upload Gallery Files to Cloudinary
      const finalImages = await Promise.all(
        validGallery.map(async (item) => {
          if (item.file) {
            const uploadData = new FormData();
            uploadData.append('image', item.file);
            const uploadRes = await API.post('/upload', uploadData, { 
              headers: { 'Content-Type': 'multipart/form-data' } 
            });
            return uploadRes.data.url;
          }
          return item.url.trim();
        })
      );

      // 2. Format Colors (Upload color variant files if attached)
      const colorMap = {
        'red': '#FF0000', 'white': '#FFFFFF', 'black': '#000000', 'grey': '#808080', 
        'blue': '#0000FF', 'green': '#008000', 'yellow': '#FFFF00', 'purple': '#800080',
        'pink': '#FFC0CB', 'orange': '#FFA500', 'brown': '#A52A2A', 'navy': '#000080',
        'olive': '#808000', 'maroon': '#800000', 'teal': '#008080', 'silver': '#C0C0C0'
      };

      let colorsArray = await Promise.all(
        colorItems.filter(c => c.name.trim()).map(async (c) => {
          let variantUrl = c.image ? c.image.trim() : undefined;
          if (c.file) {
            const uploadData = new FormData();
            uploadData.append('image', c.file);
            const uploadRes = await API.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
            variantUrl = uploadRes.data.url;
          }
          return {
            name: c.name.trim(),
            hex: c.hex || colorMap[c.name.trim().toLowerCase()] || '#000000',
            image: variantUrl || undefined
          };
        })
      );

      if (colorsArray.length === 0 && formData.colors?.trim()) {
        colorsArray = formData.colors.split(',').map(c => {
          const name = c.trim();
          const hex = colorMap[name.toLowerCase()] || '#333333';
          return { name, hex };
        }).filter(c => c.name);
      }

      // Ensure this category is registered in categories state & localStorage
      const finalCat = formData.category.trim();
      if (!categories.some(c => c.toLowerCase() === finalCat.toLowerCase())) {
        const updatedCats = [...categories, finalCat];
        setCategories(updatedCats);
        syncCategoriesToStorage(updatedCats);
      }

      // 3. Save Product
      const productData = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: Number(formData.price),
        category: finalCat,
        description: formData.name + ' - Premium quality streetwear.',
        images: finalImages,
        colors: colorsArray
      };

      if (editingId) {
        await API.put(`/admin/products/${editingId}`, productData);
        toast.success('Product updated successfully!');
      } else {
        await API.post('/admin/products', productData);
        toast.success(`Product added to ${finalCat}!`);
      }

      setFormData({ name: '', price: '', category: '', colors: '' });
      setColorItems([{ name: '', hex: '#000000', image: '', file: null, preview: '' }]);
      setGalleryItems([{ id: 'img-init-1', url: '', file: null, preview: '' }]);
      setEditingId(null);
      setShowInlineAddCat(false);
      if (e.target.reset) e.target.reset();
      setActiveTab('list');
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error('Error saving product: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Filtered Products by Search Query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => {
      const matchName = p.name?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      const matchPrice = String(p.price || '').includes(q);
      const matchColor = p.colors?.some(c => c.name?.toLowerCase().includes(q));
      return matchName || matchCat || matchPrice || matchColor;
    });
  }, [products, searchQuery]);

  // Uncategorized products that don't match any known category
  const uncategorizedProducts = useMemo(() => {
    return filteredProducts.filter(p => {
      if (!p.category) return true;
      return !categories.some(cat => cat.toLowerCase().trim() === p.category.toLowerCase().trim());
    });
  }, [filteredProducts, categories]);

  // Categories to display according to filter
  const displayedCategories = useMemo(() => {
    if (selectedCategoryFilter === 'ALL') {
      return categories;
    }
    if (selectedCategoryFilter === 'UNCATEGORIZED') {
      return [];
    }
    return categories.filter(c => c === selectedCategoryFilter);
  }, [categories, selectedCategoryFilter]);

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Top Header */}
      <div className="panel-header" style={{ padding: '0 0 20px 0', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="h2" style={{ margin: 0, fontWeight: 700 }}>Products</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className={activeTab === 'list' ? 'btn-primary' : 'btn-outline'} 
            onClick={() => setActiveTab('list')}
            style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
          >
            <FiList /> All Products
          </button>
          <button 
            className={activeTab === 'add' ? 'btn-primary' : 'btn-outline'} 
            onClick={() => {
              setActiveTab('add');
              setEditingId(null);
              setFormData({ name: '', price: '', category: categories[0] || 'Baggy Trousers', colors: '' });
              setColorItems([{ name: '', hex: '#000000', image: '', file: null, preview: '' }]);
              setGalleryItems([{ id: 'img-1', url: '', file: null, preview: '' }]);
              setShowInlineAddCat(false);
            }}
            style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
          >
            <FiPlus /> {editingId ? 'Edit Product' : 'Add Product'}
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="admin-panel" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
        {activeTab === 'list' && (
          <div>
            {/* Search Bar & Quick Category Creation Bar */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '18px',
              flexWrap: 'wrap',
              background: 'var(--bg-primary, #ffffff)',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-medium, #e0e0e0)'
            }}>
              {/* Search Box */}
              <div className="category-search-wrapper">
                <FiSearch className="category-search-icon" size={17} />
                <input 
                  type="text"
                  placeholder="Search products by name, price, or color..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="category-search-input"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="category-clear-btn"
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </div>

              {/* Quick Add Category Button */}
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowAddCategoryModal(true)}
                style={{
                  padding: '9px 16px',
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                  fontWeight: 600
                }}
              >
                <FiFolderPlus size={16} /> + New Category
              </button>
            </div>

            {/* Category Quick Filter Pills Bar */}
            <div className="category-tabs-bar">
              <button 
                type="button"
                className={`category-tab-pill ${selectedCategoryFilter === 'ALL' ? 'active' : ''}`}
                style={selectedCategoryFilter === 'ALL' 
                  ? { background: '#0e0e0e', color: '#ffffff', borderColor: '#0e0e0e', fontWeight: 700 } 
                  : { background: '#ffffff', color: '#2b2b2b', borderColor: '#e0e0e0' }}
                onClick={() => setSelectedCategoryFilter('ALL')}
              >
                <FiBox size={14} /> All Categories ({products.length})
              </button>

              {categories.map(cat => {
                const count = products.filter(p => (p.category || '').toLowerCase().trim() === cat.toLowerCase().trim()).length;
                const isSelected = selectedCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`category-tab-pill ${isSelected ? 'active' : ''}`}
                    style={isSelected 
                      ? { background: '#0e0e0e', color: '#ffffff', borderColor: '#0e0e0e', fontWeight: 700 } 
                      : { background: '#ffffff', color: '#2b2b2b', borderColor: '#e0e0e0' }}
                    onClick={() => setSelectedCategoryFilter(cat)}
                  >
                    <FiLayers size={14} /> {cat} ({count})
                  </button>
                );
              })}

              {uncategorizedProducts.length > 0 && (
                <button
                  type="button"
                  className={`category-tab-pill ${selectedCategoryFilter === 'UNCATEGORIZED' ? 'active' : ''}`}
                  style={selectedCategoryFilter === 'UNCATEGORIZED' 
                    ? { background: '#e74c3c', color: '#ffffff', borderColor: '#e74c3c', fontWeight: 700 } 
                    : { background: '#ffffff', color: '#e74c3c', borderColor: 'rgba(231, 76, 60, 0.4)' }}
                  onClick={() => setSelectedCategoryFilter('UNCATEGORIZED')}
                >
                  Uncategorized ({uncategorizedProducts.length})
                </button>
              )}
            </div>

            {/* Quick Category Add Modal */}
            {showAddCategoryModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(5px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}>
                <div style={{
                  background: '#161616',
                  border: '1px solid var(--gold, #c9a84c)',
                  borderRadius: '14px',
                  padding: '24px',
                  width: '100%',
                  maxWidth: '440px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiFolderPlus color="var(--gold)" /> Add New Category
                    </h3>
                    <button 
                      type="button" 
                      onClick={() => { setShowAddCategoryModal(false); setNewCatInput(''); }}
                      style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: '4px' }}
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#888', marginTop: 0, marginBottom: '16px' }}>
                    A separate dedicated portion will be generated immediately for this category on this page.
                  </p>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (handleCreateCategory(newCatInput)) {
                      setShowAddCategoryModal(false);
                      setNewCatInput('');
                    }
                  }}>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="e.g. Hoodies, Sweaters, Polo Shirts, Caps"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      autoFocus
                      required
                      style={{ width: '100%', padding: '12px', fontSize: '0.92rem', marginBottom: '16px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button 
                        type="button" 
                        className="btn-outline" 
                        onClick={() => { setShowAddCategoryModal(false); setNewCatInput(''); }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary" style={{ padding: '8px 20px' }}>
                        Create Category Portion
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gold)' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #333', borderTopColor: 'var(--gold)', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
                <p>Loading catalog portions...</p>
              </div>
            ) : (
              <>
                {/* 1. Categorized Portions */}
                {displayedCategories.map(categoryName => {
                  const catProducts = filteredProducts.filter(
                    p => (p.category || '').toLowerCase().trim() === categoryName.toLowerCase().trim()
                  );
                  const isCollapsed = !!collapsedCategories[categoryName];

                  // If user is searching and this category has no matches, hide it
                  if (searchQuery.trim() && catProducts.length === 0) {
                    return null;
                  }

                  return (
                    <div key={categoryName} className="category-portion-card">
                      {/* Portion Header */}
                      <div className="category-portion-header">
                        <div className="category-portion-title-group">
                          <div className="category-icon-wrapper">
                            <FiLayers size={20} />
                          </div>
                          <div>
                            <div className="category-title-row">
                              <h3 className="category-portion-name">{categoryName}</h3>
                              <span className="category-count-badge">
                                {catProducts.length} {catProducts.length === 1 ? 'Product' : 'Products'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Portion Actions */}
                        <div className="category-portion-actions">
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => handleAddProductForCategory(categoryName)}
                            style={{
                              padding: '7px 14px',
                              fontSize: '0.8rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              borderRadius: '6px',
                              fontWeight: 600
                            }}
                          >
                            <FiPlus size={14} /> Add Product
                          </button>
                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() => toggleCategoryCollapse(categoryName)}
                            style={{ padding: '7px 10px', fontSize: '0.8rem', borderRadius: '6px' }}
                            title={isCollapsed ? 'Expand section' : 'Collapse section'}
                          >
                            {isCollapsed ? <FiChevronDown size={16} /> : <FiChevronUp size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Portion Content */}
                      {!isCollapsed && (
                        <div className="category-portion-body">
                          {catProducts.length === 0 ? (
                            <div className="category-empty-state">
                              <p style={{ margin: 0 }}>No products in <strong>{categoryName}</strong> yet.</p>
                              <button 
                                type="button" 
                                className="btn-primary" 
                                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
                                onClick={() => handleAddProductForCategory(categoryName)}
                              >
                                <FiPlus /> Add First Product
                              </button>
                            </div>
                          ) : (
                            /* Desktop & Mobile Responsive Table */
                            <div className="table-responsive">
                              <table className="admin-table">
                                <thead>
                                  <tr>
                                    <th style={{ width: '70px' }}>Image</th>
                                    <th>Product Name</th>
                                    <th>Price</th>
                                    <th>Colors Available</th>
                                    <th>Stock Status</th>
                                    <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {catProducts.map(product => {
                                    const pId = product.id || product._id;
                                    const stock = product.stock || 0;
                                    return (
                                      <tr key={pId}>
                                        <td>
                                          <img 
                                            src={product.images?.[0] || 'https://via.placeholder.com/50'} 
                                            alt={product.name} 
                                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-medium)' }} 
                                          />
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                          {product.name}
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                          Rs. {Number(product.price || 0).toLocaleString()}
                                        </td>
                                        <td>
                                          {product.colors && product.colors.length > 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                              {product.colors.map((c, i) => (
                                                <span 
                                                  key={i} 
                                                  title={c.name}
                                                  style={{ 
                                                    width: '18px', 
                                                    height: '18px', 
                                                    borderRadius: '50%', 
                                                    backgroundColor: c.hex || '#333', 
                                                    border: '1.5px solid rgba(0,0,0,0.15)',
                                                    display: 'inline-block' 
                                                  }}
                                                />
                                              ))}
                                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                ({product.colors.length})
                                              </span>
                                            </div>
                                          ) : (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Default</span>
                                          )}
                                        </td>
                                        <td>
                                          <span style={{
                                            fontSize: '0.74rem',
                                            fontWeight: 700,
                                            padding: '3px 9px',
                                            borderRadius: '12px',
                                            background: stock > 5 ? 'rgba(46, 125, 50, 0.15)' : (stock > 0 ? 'rgba(230, 126, 34, 0.15)' : 'rgba(231, 76, 60, 0.15)'),
                                            color: stock > 5 ? '#2e7d32' : (stock > 0 ? '#e67e22' : '#e74c3c'),
                                            border: '1px solid currentColor'
                                          }}>
                                            {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                                          </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                                            <button 
                                              className="btn-outline" 
                                              style={{ padding: '6px 14px', fontSize: '0.76rem', borderRadius: '6px' }} 
                                              onClick={() => handleEditClick(product)}
                                            >
                                              Edit
                                            </button>
                                            <button 
                                              className="btn-outline" 
                                              style={{ padding: '6px 14px', fontSize: '0.76rem', borderColor: 'var(--red)', color: 'var(--red)', borderRadius: '6px' }} 
                                              onClick={() => handleDelete(pId)}
                                            >
                                              <FiTrash2 /> Delete
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 2. Uncategorized Section (if any product lacks category) */}
                {(selectedCategoryFilter === 'ALL' || selectedCategoryFilter === 'UNCATEGORIZED') && uncategorizedProducts.length > 0 && (
                  <div className="category-portion-card" style={{ borderColor: 'rgba(231, 76, 60, 0.35)' }}>
                    <div className="category-portion-header">
                      <div className="category-portion-title-group">
                        <div className="category-icon-wrapper" style={{ background: 'rgba(231, 76, 60, 0.12)', color: '#e74c3c', borderColor: 'rgba(231, 76, 60, 0.3)' }}>
                          <FiBox size={20} />
                        </div>
                        <div>
                          <div className="category-title-row">
                            <h3 className="category-portion-name">Uncategorized / Other Products</h3>
                            <span className="category-count-badge" style={{ background: 'rgba(231, 76, 60, 0.12)', color: '#e74c3c' }}>
                              {uncategorizedProducts.length} Items
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="category-portion-body">
                      {/* Responsive Table */}
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th style={{ width: '70px' }}>Image</th>
                              <th>Product Name</th>
                              <th>Price</th>
                              <th>Current Category</th>
                              <th style={{ textAlign: 'right', paddingRight: '20px' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {uncategorizedProducts.map(product => {
                              const pId = product.id || product._id;
                              return (
                                <tr key={pId}>
                                  <td>
                                    <img 
                                      src={product.images?.[0] || 'https://via.placeholder.com/50'} 
                                      alt={product.name} 
                                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-medium)' }} 
                                    />
                                  </td>
                                  <td style={{ fontWeight: 600 }}>{product.name}</td>
                                  <td style={{ fontWeight: 600, color: 'var(--gold)' }}>Rs. {product.price}</td>
                                  <td style={{ color: 'var(--red)' }}>{product.category || 'None'}</td>
                                  <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                                      <button 
                                        className="btn-outline" 
                                        style={{ padding: '6px 14px', fontSize: '0.76rem', borderRadius: '6px' }} 
                                        onClick={() => handleEditClick(product)}
                                      >
                                        Assign Category
                                      </button>
                                      <button 
                                        className="btn-outline" 
                                        style={{ padding: '6px 14px', fontSize: '0.76rem', borderColor: 'var(--red)', color: 'var(--red)', borderRadius: '6px' }} 
                                        onClick={() => handleDelete(pId)}
                                      >
                                        <FiTrash2 /> Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* If search query produced no results anywhere */}
                {searchQuery.trim() && filteredProducts.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '50px 20px',
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)'
                  }}>
                    <FiSearch size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                    <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>No products found</h3>
                    <p style={{ margin: 0, fontSize: '0.88rem' }}>No products match your search query "{searchQuery}".</p>
                    <button 
                      type="button" 
                      className="btn-outline" 
                      onClick={() => setSearchQuery('')}
                      style={{ marginTop: '14px', padding: '6px 16px', fontSize: '0.82rem' }}
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: Add or Edit Product Form */}
        {activeTab === 'add' && (
          <form 
            onSubmit={handleSubmit} 
            className="panel-body" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px', 
              maxWidth: '680px',
              background: 'var(--bg-primary, #141414)',
              border: '1px solid var(--border-medium, #282828)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => setActiveTab('list')} 
                className="btn-outline" 
                style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '8px' }}
              >
                <FiArrowLeft /> Back to Products
              </button>
              <span className="admin-page-badge">
                {editingId ? 'Editing Product' : 'New Product Entry'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Product Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
                className="form-input" 
                placeholder="e.g. Drake Signature Baggy Trousers / Heavyweight Tee" 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Price (RS) *</label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleInputChange} 
                required 
                className="form-input" 
                placeholder="e.g. 3499" 
              />
            </div>

            {/* Category Selector with Dynamic Options + Inline Creator */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Category Portion *</label>
                <button
                  type="button"
                  onClick={() => setShowInlineAddCat(!showInlineAddCat)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gold, #c9a84c)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FiPlus size={14} /> {showInlineAddCat ? 'Choose Existing' : '+ New Category'}
                </button>
              </div>

              {!showInlineAddCat ? (
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  className="form-input" 
                  required
                >
                  <option value="" disabled>-- Select Category Portion --</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <div className="inline-category-box">
                  <span style={{ fontSize: '0.82rem', color: 'var(--gold)' }}>
                    Type the name of your new category portion:
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Heavyweight Hoodies, Caps, Jackets"
                      value={inlineCatInput}
                      onChange={(e) => setInlineCatInput(e.target.value)}
                      className="form-input"
                      style={{ flex: 1, fontSize: '0.85rem' }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      onClick={() => {
                        if (handleCreateCategory(inlineCatInput)) {
                          setInlineCatInput('');
                          setShowInlineAddCat(false);
                        }
                      }}
                    >
                      Save & Select
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                      onClick={() => setShowInlineAddCat(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Color Variants Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Color Variants & Dedicated Images</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                  Add color variants for this product. You can paste an Image URL OR upload a file for each specific color variant!
                </p>
              </div>

              {colorItems.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px', 
                  background: 'var(--bg-elevated, #1a1a1a)', 
                  padding: '16px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border-medium)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  {/* Top Bar: Color Name & Color Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Color #{idx + 1}:</span>
                      <input 
                        type="text" 
                        placeholder="Color Name (e.g. Cobalt Blue, White, Red)" 
                        value={item.name} 
                        onChange={(e) => {
                          const newArr = [...colorItems];
                          newArr[idx].name = e.target.value;
                          setColorItems(newArr);
                        }} 
                        className="form-input" 
                        style={{ flex: 1, minWidth: '130px' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hex:</label>
                      <input 
                        type="color" 
                        value={item.hex || '#000000'} 
                        onChange={(e) => {
                          const newArr = [...colorItems];
                          newArr[idx].hex = e.target.value;
                          setColorItems(newArr);
                        }} 
                        style={{ width: '38px', height: '38px', border: '1px solid var(--border-medium)', borderRadius: '6px', cursor: 'pointer', background: 'none', padding: '2px' }} 
                      />
                      {colorItems.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => setColorItems(colorItems.filter((_, i) => i !== idx))} 
                          style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '6px', marginLeft: '4px' }}
                          title="Remove Color Variant"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dual Image Input Options for Color Variant */}
                  <div style={{ background: 'var(--bg-primary, #111111)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: '500', color: 'var(--text-primary)' }}>Variant Image (Displayed when this color is clicked/hovered)</label>
                    
                    {/* Option 1: URL */}
                    <div>
                      <input 
                        type="url" 
                        placeholder="Option 1: Paste Color Image URL (e.g. https://...)" 
                        value={item.image || ''} 
                        onChange={(e) => {
                          const newArr = [...colorItems];
                          newArr[idx].image = e.target.value;
                          newArr[idx].file = null;
                          setColorItems(newArr);
                        }} 
                        className="form-input" 
                        disabled={!!item.file}
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '2px 0' }}>
                      <hr style={{ flex: 1, borderTop: '1px solid var(--border-light)', margin: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OR</span>
                      <hr style={{ flex: 1, borderTop: '1px solid var(--border-light)', margin: 0 }} />
                    </div>

                    {/* Option 2: File Upload */}
                    <div>
                      <input 
                        type="file" 
                        accept="image/*"
                        disabled={!!item.image}
                        onChange={(e) => {
                          const newArr = [...colorItems];
                          newArr[idx].file = e.target.files[0] || null;
                          if (e.target.files[0]) newArr[idx].image = '';
                          setColorItems(newArr);
                        }} 
                        style={{ 
                          padding: '10px', 
                          border: '1.5px dashed var(--border-medium)', 
                          borderRadius: '6px', 
                          width: '100%', 
                          cursor: 'pointer',
                          background: 'var(--bg-elevated)',
                          fontSize: '0.82rem'
                        }} 
                      />
                      {item.file && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: '4px', marginBottom: 0 }}>✓ File selected: {item.file.name}</p>
                      )}
                    </div>

                    {/* Variant Image Preview */}
                    {(item.image || item.file) && (
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Variant Preview:</span>
                        <img 
                          src={item.file ? URL.createObjectURL(item.file) : item.image} 
                          alt="Variant Preview" 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-medium)' }} 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={() => setColorItems([...colorItems, { name: '', hex: '#000000', image: '', file: null }])}
                className="btn-outline"
                style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
              >
                <FiPlus /> Add Another Color Variant
              </button>
            </div>

            {/* Dynamic Multi-Image Product Gallery Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <label style={{ fontWeight: '600', fontSize: '0.98rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiImage style={{ color: 'var(--gold)' }} /> Product Images Gallery ({galleryItems.filter(i => i.url?.trim() || i.file).length} added) *
                  </label>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: 0 }}>
                    Image #1 is the <strong>Cover Photo</strong> displayed on shop cards. User can scroll through all photos when viewing the product.
                  </p>
                </div>

                {/* Batch Multi-Upload Button */}
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  borderRadius: '6px',
                  background: 'rgba(201, 168, 76, 0.12)',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}>
                  <FiUploadCloud size={16} /> Upload Multiple Images from Computer
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleMultipleGalleryFiles}
                  />
                </label>
              </div>

              {/* Gallery Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {galleryItems.map((item, idx) => (
                  <div key={item.id || idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    background: 'var(--bg-elevated)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: idx === 0 ? '1.5px solid var(--gold)' : '1px solid var(--border-medium)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}>
                    {/* Index & Order Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '45px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '3px 7px',
                        borderRadius: '4px',
                        background: idx === 0 ? 'var(--gold)' : 'var(--bg-primary)',
                        color: idx === 0 ? '#000000' : 'var(--text-secondary)',
                        letterSpacing: '0.04em'
                      }}>
                        {idx === 0 ? 'Cover' : `#${idx + 1}`}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          type="button" 
                          disabled={idx === 0}
                          onClick={() => handleMoveGalleryItem(idx, -1)}
                          style={{ background: 'none', border: 'none', color: idx === 0 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: idx === 0 ? 'default' : 'pointer', padding: '2px' }}
                          title="Move Up"
                        >
                          <FiArrowUp size={13} />
                        </button>
                        <button 
                          type="button" 
                          disabled={idx === galleryItems.length - 1}
                          onClick={() => handleMoveGalleryItem(idx, 1)}
                          style={{ background: 'none', border: 'none', color: idx === galleryItems.length - 1 ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: idx === galleryItems.length - 1 ? 'default' : 'pointer', padding: '2px' }}
                          title="Move Down"
                        >
                          <FiArrowDown size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Live Preview Thumbnail */}
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '6px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      {item.preview || item.url ? (
                        <img 
                          src={item.preview || item.url} 
                          alt={`Gallery item ${idx + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <FiImage size={20} color="var(--text-muted)" />
                      )}
                    </div>

                    {/* Image Inputs */}
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input 
                          type="url"
                          className="form-input"
                          style={{ fontSize: '0.82rem', padding: '8px 12px' }}
                          placeholder={item.file ? `File attached: ${item.file.name}` : "Option 1: Paste Image URL (https://...)"}
                          value={item.url || ''}
                          disabled={!!item.file}
                          onChange={(e) => handleUpdateGalleryUrl(idx, e.target.value)}
                        />
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '7px 12px',
                          borderRadius: '6px',
                          background: 'var(--bg-primary)',
                          border: '1px dashed var(--border-medium)',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          color: 'var(--text-secondary)'
                        }}>
                          Choose File
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleUpdateGalleryFile(idx, e.target.files[0])}
                          />
                        </label>
                      </div>
                      {item.file && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>
                          ✓ Selected: {item.file.name}
                        </span>
                      )}
                    </div>

                    {/* Delete item button */}
                    {galleryItems.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveGalleryItem(idx)}
                        style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '8px' }}
                        title="Remove image"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Single Slot Button */}
              <button 
                type="button" 
                onClick={handleAddGallerySlot}
                className="btn-outline"
                style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px' }}
              >
                <FiPlus /> Add Single Image Slot
              </button>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={uploading} 
              style={{ marginTop: '12px', padding: '14px', width: '100%', fontSize: '1rem', borderRadius: '8px' }}
            >
              {uploading ? 'Uploading & Saving to Store...' : (editingId ? 'Update Product' : 'Add Product to Store')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
