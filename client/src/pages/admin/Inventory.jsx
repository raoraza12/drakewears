import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiSearch, FiPackage, FiDownload, FiPlus, FiMinus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../api';
import './Admin.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await API.get('/products?limit=1000');
      const mapped = (res.data.products || res.data || []).map(p => ({
        ...p,
        sku: p.slug || p._id || p.id,
        status: p.stock > 5 ? 'In Stock' : (p.stock > 0 ? 'Low Stock' : 'Out of Stock')
      }));
      setProducts(mapped);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleManualStockChange = (product, val) => {
    const pId = product._id || product.id;
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setProducts(prev => prev.map(p => {
      if ((p._id || p.id) === pId) {
        const numericVal = num === '' ? 0 : num;
        return {
          ...p,
          stock: num,
          status: numericVal > 5 ? 'In Stock' : (numericVal > 0 ? 'Low Stock' : 'Out of Stock')
        };
      }
      return p;
    }));
  };

  const handleManualStockSubmit = async (product, val) => {
    const newStock = Math.max(0, parseInt(val, 10) || 0);
    const pId = product._id || product.id;
    setUpdatingId(pId);

    // Normalize stock state to valid number
    setProducts(prev => prev.map(p => {
      if ((p._id || p.id) === pId) {
        return {
          ...p,
          stock: newStock,
          status: newStock > 5 ? 'In Stock' : (newStock > 0 ? 'Low Stock' : 'Out of Stock')
        };
      }
      return p;
    }));

    try {
      await API.put(`/admin/products/${pId}`, { stock: newStock });
      toast.success(`Stock updated for ${product.name} to ${newStock}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const exportToCSV = () => {
    if (products.length === 0) {
      toast.error('No inventory data to export');
      return;
    }

    const headers = ['Product Name', 'SKU', 'Price (PKR)', 'Stock Quantity', 'Status'];
    const rows = products.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      p.price,
      p.stock,
      `"${p.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `drakewears_inventory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory CSV exported successfully! 📥');
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const healthyCount = products.filter(p => p.stock > 5).length;
  const lowCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="admin-page animate-fade-in">
      <div className="admin-header-flex" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="h2" style={{ fontWeight: 600 }}>Inventory & Stock Alerts</h1>
          <p className="text-body" style={{ marginTop: '4px' }}>Monitor your products and manage stock levels.</p>
        </div>
        <button 
          className="btn-export-csv" 
          onClick={exportToCSV} 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '11px 22px', 
            borderRadius: '8px', 
            background: '#0e0e0e', 
            color: '#ffffff', 
            border: 'none', 
            fontWeight: 500, 
            fontSize: '0.875rem', 
            cursor: 'pointer', 
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}
        >
          <FiDownload size={16} />
          Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="card-premium" style={{ padding: '24px', borderLeft: '4px solid #2ecc71' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <FiCheckCircle style={{ color: '#2ecc71', marginRight: '8px' }} size={20} />
            <span className="text-body" style={{ fontWeight: 500 }}>Healthy Stock</span>
          </div>
          <h2 className="h2" style={{ margin: 0 }}>{healthyCount}</h2>
          <p className="text-caption" style={{ marginTop: '4px' }}>Products well stocked</p>
        </div>
        <div className="card-premium" style={{ padding: '24px', borderLeft: '4px solid #f39c12' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <FiAlertTriangle style={{ color: '#f39c12', marginRight: '8px' }} size={20} />
            <span className="text-body" style={{ fontWeight: 500 }}>Low Stock</span>
          </div>
          <h2 className="h2" style={{ margin: 0 }}>{lowCount}</h2>
          <p className="text-caption" style={{ marginTop: '4px' }}>Less than 5 items left</p>
        </div>
        <div className="card-premium" style={{ padding: '24px', borderLeft: '4px solid #e74c3c' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <FiPackage style={{ color: '#e74c3c', marginRight: '8px' }} size={20} />
            <span className="text-body" style={{ fontWeight: 500 }}>Out of Stock</span>
          </div>
          <h2 className="h2" style={{ margin: 0 }}>{outCount}</h2>
          <p className="text-caption" style={{ marginTop: '4px' }}>Require immediate restock</p>
        </div>
      </div>

      <div className="card-premium">
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Search by SKU or name..." 
              className="form-input"
              style={{ paddingLeft: '40px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '8px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-caption">Showing {filteredProducts.length} of {products.length} products</div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-medium)' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Product</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>SKU</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Stock</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 500, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 500, color: 'var(--text-secondary)' }}>Update Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-light)' }}>No matching products found</td></tr>
              ) : (
                filteredProducts.map((product) => {
                  const pId = product._id || product.id;
                  const isUpdating = updatingId === pId;
                  return (
                    <tr key={pId} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="table-row-hover">
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 500 }}>{product.name}</div>
                        <div className="text-caption" style={{ marginTop: '4px' }}>Rs. {product.price}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{product.sku}</td>
                      <td style={{ padding: '16px 20px', fontWeight: 600, color: product.stock <= 5 ? '#e74c3c' : 'inherit' }}>
                        {product.stock}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          background: product.status === 'In Stock' ? '#e8f5e9' : (product.status === 'Low Stock' ? '#fff3e0' : '#ffebee'),
                          color: product.status === 'In Stock' ? '#2e7d32' : (product.status === 'Low Stock' ? '#e67e22' : '#c0392b')
                        }}>
                          {product.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-medium)', borderRadius: '8px', overflow: 'hidden', background: '#ffffff' }}>
                          <button 
                            disabled={isUpdating || product.stock <= 0}
                            onClick={() => handleManualStockSubmit(product, Math.max(0, (product.stock || 0) - 1))}
                            style={{ padding: '8px 14px', background: 'var(--bg-elevated)', border: 'none', borderRight: '1px solid var(--border-medium)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Decrease Stock"
                          >
                            <FiMinus size={14} />
                          </button>
                          <input 
                            type="number"
                            min="0"
                            value={product.stock}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleManualStockChange(product, e.target.value)}
                            onBlur={(e) => handleManualStockSubmit(product, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                            style={{ width: '54px', textAlign: 'center', fontWeight: 600, fontSize: '0.95rem', border: 'none', outline: 'none', background: 'transparent' }} 
                            title="Click or type number to edit stock manually"
                          />
                          <button 
                            disabled={isUpdating}
                            onClick={() => handleManualStockSubmit(product, (product.stock || 0) + 1)}
                            style={{ padding: '8px 14px', background: 'var(--bg-elevated)', border: 'none', borderLeft: '1px solid var(--border-medium)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Increase Stock"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
