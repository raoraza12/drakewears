import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import './Admin.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    category: '',
    stock: '',
    images: [''],
    colors: [{ name: '', hex: '#000000', image: '' }],
    sizes: [],
    material: '',
    care: '',
  });

  const categories = ['Baggy Trousers', 'Drop Shoulder Tees'];
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

  useEffect(() => {
    if (isEdit) {
      API.get(`/products/${id}`)
        .then(res => setForm({
          ...res.data,
          images: res.data.images.length ? res.data.images : [''],
          colors: res.data.colors.length ? res.data.colors : [{ name: '', hex: '#000000', image: '' }]
        }))
        .catch(() => toast.error('Error loading product data'));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await API.put(`/admin/products/${id}`, form);
        toast.success('Product updated! ✨');
      } else {
        await API.post('/admin/products', form);
        toast.success('Product created! ✨');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const addItem = (field, defaultValue) => setForm({ ...form, [field]: [...form[field], defaultValue] });
  const removeItem = (field, index) => setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  const updateItem = (field, index, value) => {
    const newList = [...form[field]];
    newList[index] = value;
    setForm({ ...form, [field]: newList });
  };

  const handleSizeToggle = (size) => {
    const newSizes = form.sizes.includes(size) 
      ? form.sizes.filter(s => s !== size) 
      : [...form.sizes, size];
    setForm({ ...form, sizes: newSizes });
  };

  return (
    <div className="product-form-wrapper" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
      <div className="flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <button onClick={() => navigate('/admin/products')} className="btn-ghost" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <FiArrowLeft /> Back to Archive
        </button>
        <h2 className="section-title" style={{ fontSize: '1.5rem', margin: 0 }}>{isEdit ? 'Refine Product' : 'Registry: New Product'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-card">
        {/* Core Info */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Commercial Name</label>
            <input required className="form-input" value={form.name} onChange={e => {
              const val = e.target.value;
              let autoCategory = form.category;
              if (val.toLowerCase().includes('trouser') || val.toLowerCase().includes('pant')) {
                autoCategory = 'Baggy Trousers';
              } else if (val.toLowerCase().includes('tee') || val.toLowerCase().includes('shirt')) {
                autoCategory = 'Drop Shoulder Tees';
              }
              setForm({...form, name: val, category: autoCategory});
            }} placeholder="e.g. Signature Silk Blazer" />
          </div>
          <div className="form-group">
            <label className="form-label">SEO Slug</label>
            <input required className="form-input" value={form.slug} onChange={e => setForm({...form, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} placeholder="signature-silk-blazer" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price Settlement ($)</label>
            <input required type="number" className="form-input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Inventory Level</label>
            <input required type="number" className="form-input" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Exhibition Category</label>
          <select required className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            <option value="" disabled>-- Select Category --</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Product Narrative</label>
          <textarea rows="4" required className="form-input" style={{ resize: 'none' }} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the craftsmanship..." />
        </div>

        <div className="gold-divider" style={{ margin: '30px 0', opacity: 0.3 }}></div>

        {/* Dynamic Images */}
        <div className="form-group">
          <label className="form-label">Media Gallery (URLs)</label>
          {form.images.map((url, idx) => (
            <div key={idx} className="dynamic-list-item">
              <input className="form-input" value={url} onChange={e => updateItem('images', idx, e.target.value)} placeholder="https://unsplash.com/..." />
              {form.images.length > 1 && <button type="button" onClick={() => removeItem('images', idx)} style={{ background: 'none', color: 'var(--red)' }}><FiTrash2 /></button>}
            </div>
          ))}
          <button type="button" onClick={() => addItem('images', '')} className="btn-add-more">
            <FiPlus /> Integrate Media URL
          </button>
        </div>

        {/* Dynamic Colors */}
        <div className="form-group">
          <label className="form-label">Artisan Palette</label>
           {form.colors.map((c, idx) => (
            <div key={idx} className="dynamic-list-item" style={{ flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <input className="form-input" style={{ flex: 1, minWidth: '150px' }} value={c.name} onChange={e => {
                const newList = [...form.colors];
                newList[idx].name = e.target.value;
                setForm({...form, colors: newList});
              }} placeholder="Name (e.g. Cobalt)" />
              <input type="color" style={{ width: '45px', height: '45px', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer', background: 'none', padding: '2px' }} value={c.hex} onChange={e => {
                const newList = [...form.colors];
                newList[idx].hex = e.target.value;
                setForm({...form, colors: newList});
              }} />
              <input className="form-input" style={{ flex: 2, minWidth: '200px' }} value={c.image || ''} onChange={e => {
                const newList = [...form.colors];
                newList[idx].image = e.target.value;
                setForm({...form, colors: newList});
              }} placeholder="Image URL (optional)" />
              {form.colors.length > 1 && <button type="button" onClick={() => removeItem('colors', idx)} style={{ background: 'none', color: 'var(--red)' }}><FiTrash2 /></button>}
            </div>
          ))}
          <button type="button" onClick={() => addItem('colors', { name: '', hex: '#000000', image: '' })} className="btn-add-more">
            <FiPlus /> Introduce Hue
          </button>
        </div>

        <div className="gold-divider" style={{ margin: '30px 0', opacity: 0.3 }}></div>

        {/* Sizes */}
        <div className="form-group">
          <label className="form-label">Available Dimensions</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {availableSizes.map(size => (
              <button key={size} type="button" onClick={() => handleSizeToggle(size)} 
                className={`btn-ghost ${form.sizes.includes(size) ? 'active' : ''}`}
                style={{
                  background: form.sizes.includes(size) ? 'var(--gold)' : 'var(--bg-input)',
                  color: form.sizes.includes(size) ? '#000' : 'var(--text-secondary)',
                  border: '1px solid var(--border-light)',
                  fontWeight: form.sizes.includes(size) ? '700' : '400'
                }}>
                {size}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '40px', padding: '18px' }}>
          <FiSave /> {isEdit ? 'Commit Changes' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
