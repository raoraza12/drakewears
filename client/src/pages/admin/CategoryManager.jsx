import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiLayers, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../api';
import './Admin.css';

const CategoryManager = () => {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('drakewears_admin_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: '1', name: 'Drop Shoulder Tees', status: 'Active' },
      { id: '2', name: 'Baggy Trousers', status: 'Active' }
    ];
  });

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    localStorage.setItem('drakewears_admin_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    fetchLiveProducts();
  }, []);

  const fetchLiveProducts = async () => {
    try {
      const res = await API.get('/products?limit=1000');
      const allProds = res.data.products || res.data || [];
      setProducts(allProds);

      // Auto add any categories from live DB if not already present
      const dbCategories = Array.from(new Set(allProds.map(p => p.category).filter(Boolean)));
      setCategories(prev => {
        const existingNames = prev.map(c => c.name.toLowerCase().trim());
        const toAdd = dbCategories
          .filter(cat => !existingNames.includes(cat.toLowerCase().trim()))
          .map(cat => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            name: cat,
            status: 'Active'
          }));
        if (toAdd.length > 0) {
          return [...prev, ...toAdd];
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const getItemCount = (catName) => {
    const searchTarget = catName.toLowerCase().trim();
    return products.filter(p => {
      const cat = (p.category || '').toLowerCase().trim();
      const sub = (p.subcategory || '').toLowerCase().trim();
      return cat.includes(searchTarget) || searchTarget.includes(cat) || sub.includes(searchTarget);
    }).length;
  };

  const handleDelete = (id) => {
    const target = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success(`Category "${target?.name || ''}" removed`);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat = {
      id: Date.now().toString(),
      name: newCatName.trim(),
      status: 'Active'
    };
    setCategories(prev => [...prev, newCat]);
    setNewCatName('');
    setShowModal(false);
    toast.success(`Category "${newCat.name}" created! 🎉`);
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="h2" style={{ fontWeight: 600 }}>Categories & Collections</h1>
          <p className="text-body" style={{ marginTop: '4px' }}>Organize your products for a better shopping experience.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus style={{ marginRight: '8px' }} />
          New Category
        </button>
      </div>

      <div className="card-premium">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="form-input"
              style={{ paddingLeft: '40px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '8px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-caption">Showing {filteredCategories.length} of {categories.length} categories</div>
        </div>
        
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Name</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Live Products</th>
              <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map((cat) => (
              <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="table-row-hover">
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', color: 'var(--text-secondary)' }}>
                      <FiLayers />
                    </div>
                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {getItemCount(cat.name)} {getItemCount(cat.name) === 1 ? 'item' : 'items'}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: cat.status === 'Active' ? '#e8f5e9' : '#f5f5f5',
                    color: cat.status === 'Active' ? '#2e7d32' : '#616161'
                  }}>
                    {cat.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button className="btn-icon" onClick={() => handleDelete(cat.id)} style={{ color: '#e74c3c' }} title="Delete"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredCategories.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-light)' }}>
            No matching categories found.
          </div>
        )}
      </div>

      {/* New Category Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontWeight: 600 }}>Add New Category</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Category Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Oversized Hoodies" 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                  required 
                  autoFocus
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-medium)' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
