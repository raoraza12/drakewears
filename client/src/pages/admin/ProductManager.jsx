import React, { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiPlus, FiList, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const ProductManager = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'
  const [editingId, setEditingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    colors: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFile2, setImageFile2] = useState(null);
  const [imageUrlInput2, setImageUrlInput2] = useState('');
  const [uploading, setUploading] = useState(false);
  const [colorItems, setColorItems] = useState([{ name: '', hex: '#000000', image: '' }]);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/products');
      // The backend returns { products, total, page, pages }
      setProducts(res.data.products || []);
    } catch (err) {
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
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      colors: product.colors?.map(c => c.name).join(', ') || ''
    });
    setColorItems(product.colors?.length ? product.colors.map(c => ({ name: c.name || '', hex: c.hex || '#000000', image: c.image || '' })) : [{ name: '', hex: '#000000', image: '' }]);
    setImageUrlInput(product.images?.[0] || '');
    setImageUrlInput2(product.images?.[1] || '');
    setActiveTab('add');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name') {
      let autoCategory = formData.category;
      if (value.toLowerCase().includes('trouser') || value.toLowerCase().includes('pant')) {
        autoCategory = 'Baggy Trousers';
      } else if (value.toLowerCase().includes('tee') || value.toLowerCase().includes('shirt')) {
        autoCategory = 'Drop Shoulder Tees';
      }
      setFormData({ ...formData, [name]: value, category: autoCategory });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || (!imageFile && !imageUrlInput)) {
      toast.error('Name, price, and either an image file or URL are required.');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category (Baggy Trousers or Drop Shoulder Tees).');
      return;
    }

    setUploading(true);

    try {
      // 1. Image Handling
      let imageUrl1 = imageUrlInput;
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);

        const uploadRes = await API.post('/upload', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl1 = uploadRes.data.url;
      }

      let imageUrl2 = imageUrlInput2;
      if (imageFile2) {
        const uploadData2 = new FormData();
        uploadData2.append('image', imageFile2);

        const uploadRes2 = await API.post('/upload', uploadData2, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl2 = uploadRes2.data.url;
      }

      const finalImages = [imageUrl1];
      if (imageUrl2) finalImages.push(imageUrl2);

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

      if (colorsArray.length === 0 && formData.colors.trim()) {
        colorsArray = formData.colors.split(',').map(c => {
          const name = c.trim();
          const hex = colorMap[name.toLowerCase()] || '#333333';
          return { name, hex };
        }).filter(c => c.name);
      }

      // 3. Save Product
      const productData = {
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: Number(formData.price),
        category: formData.category,
        description: formData.name + ' - Premium quality streetwear.',
        images: finalImages,
        colors: colorsArray
      };

      if (editingId) {
        await API.put(`/admin/products/${editingId}`, productData);
        toast.success('Product updated successfully!');
      } else {
        await API.post('/admin/products', productData);
        toast.success('Product added successfully!');
      }

      setFormData({ name: '', price: '', category: '', colors: '' });
      setColorItems([{ name: '', hex: '#000000', image: '' }]);
      setImageFile(null);
      setImageUrlInput('');
      setImageFile2(null);
      setImageUrlInput2('');
      setEditingId(null);
      if (e.target.reset) e.target.reset();
      setActiveTab('list'); // switch back to list
    } catch (err) {
      console.error(err);
      toast.error('Error adding product: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="panel-header" style={{ padding: '0 0 24px 0', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="h2">Product Manager</h1>
          <p className="text-body" style={{ marginTop: '8px' }}>Manage your store inventory.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={activeTab === 'list' ? 'btn-primary' : 'btn-outline'} 
            onClick={() => setActiveTab('list')}
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiList /> View All
          </button>
          <button 
            className={activeTab === 'add' ? 'btn-primary' : 'btn-outline'} 
            onClick={() => {
              setActiveTab('add');
              setEditingId(null);
              setFormData({ name: '', price: '', category: '', colors: '' });
              setColorItems([{ name: '', hex: '#000000', image: '' }]);
              setImageUrlInput('');
              setImageUrlInput2('');
            }}
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiPlus /> {editingId ? 'Edit Product' : 'Add Product'}
          </button>
        </div>
      </div>

      <div className="admin-panel">
        {activeTab === 'list' && (
          <div className="panel-body">
            {loading ? <p>Loading products...</p> : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No products found</td></tr>
                  ) : products.map(product => (
                    <tr key={product.id || product._id}>
                      <td>
                        <img src={product.images[0] || 'https://via.placeholder.com/50'} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      </td>
                      <td>{product.name}</td>
                      <td>Rs. {product.price}</td>
                      <td>{product.category}</td>
                      <td>{product.stock || 0}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleEditClick(product)}>
                            Edit
                          </button>
                          <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'var(--red)', color: 'var(--red)' }} onClick={() => handleDelete(product.id || product._id)}>
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <form onSubmit={handleSubmit} className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
            <button 
              type="button" 
              onClick={() => setActiveTab('list')} 
              className="btn-outline" 
              style={{ alignSelf: 'flex-start', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiArrowLeft /> Back to All Products
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500' }}>Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="form-input" placeholder="e.g. drakewears Oversized Tee" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500' }}>Price (RS) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="form-input" placeholder="e.g. 2500" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '500' }}>Category</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="form-input" required>
                <option value="" disabled>-- Select Category --</option>
                <option value="Drop Shoulder Tees">Drop Shoulder Tees</option>
                <option value="Baggy Trousers">Baggy Trousers</option>
              </select>
            </div>

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
                  background: 'var(--bg-elevated)', 
                  padding: '16px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border-medium)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  {/* Top Bar: Color Name & Color Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Color #{idx + 1}:</span>
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
                        style={{ flex: 1, minWidth: '150px' }} 
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
                  <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                          onError={(e) => e.target.style.display = 'none'}
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

            {/* Main Product Image Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Main Product Image *</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-elevated)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-medium)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Option 1: Paste Image URL (High Quality Recommended)</label>
                  <input 
                    type="url" 
                    value={imageUrlInput} 
                    onChange={(e) => { setImageUrlInput(e.target.value); setImageFile(null); }} 
                    className="form-input" 
                    placeholder="https://example.com/image.jpg" 
                    disabled={!!imageFile}
                  />
                  {imageUrlInput && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Preview:</span>
                      <img src={imageUrlInput} alt="Preview" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-medium)' }} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <hr style={{ flex: 1, borderTop: '1px solid var(--border-medium)', margin: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>OR</span>
                  <hr style={{ flex: 1, borderTop: '1px solid var(--border-medium)', margin: 0 }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Option 2: Upload File</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => { setImageFile(e.target.files[0]); setImageUrlInput(''); }} 
                    disabled={!!imageUrlInput}
                    style={{ 
                      padding: '14px', 
                      border: '2px dashed var(--border-medium)', 
                      borderRadius: '8px', 
                      width: '100%', 
                      cursor: 'pointer',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }} 
                  />
                  {imageFile && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '6px', marginBottom: 0, fontWeight: '500' }}>✓ File selected: {imageFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Hover Image Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.95rem' }}>Hover Image (Optional - Shown on Card Hover)</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--bg-elevated)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-medium)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block', fontWeight: '500' }}>Option 1: Paste Hover Image URL</label>
                  <input 
                    type="url" 
                    value={imageUrlInput2} 
                    onChange={(e) => { setImageUrlInput2(e.target.value); setImageFile2(null); }} 
                    className="form-input" 
                    placeholder="https://example.com/hover.jpg" 
                    disabled={!!imageFile2}
                  />
                  {imageUrlInput2 && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hover Preview:</span>
                      <img src={imageUrlInput2} alt="Hover Preview" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-medium)' }} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <hr style={{ flex: 1, borderTop: '1px solid var(--border-medium)', margin: 0 }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>OR</span>
                  <hr style={{ flex: 1, borderTop: '1px solid var(--border-medium)', margin: 0 }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block', fontWeight: '500' }}>Option 2: Upload Hover Image File</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => { setImageFile2(e.target.files[0]); setImageUrlInput2(''); }} 
                    disabled={!!imageUrlInput2}
                    style={{ 
                      padding: '14px', 
                      border: '2px dashed var(--border-medium)', 
                      borderRadius: '8px', 
                      width: '100%', 
                      cursor: 'pointer',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }} 
                  />
                  {imageFile2 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--gold)', marginTop: '6px', marginBottom: 0, fontWeight: '500' }}>✓ File selected: {imageFile2.name}</p>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={uploading} style={{ marginTop: '12px', padding: '14px', width: '100%', fontSize: '1rem' }}>
              {uploading ? 'Uploading & Saving...' : 'Add Product to Store'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
