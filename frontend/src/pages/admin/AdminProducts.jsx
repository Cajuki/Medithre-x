import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Search, Plus, Edit2, Trash2,
  ChevronLeft, ChevronRight, X, Save,
  Upload, ImagePlus, Loader
} from 'lucide-react';
import './AdminPages.css';
import './AdminProducts.css';

const EMPTY = {
  name:'', description:'', short_description:'', category:'',
  price:'', sale_price:'', price_on_request:false, brand:'', origin:'',
  in_stock:true, featured:false, is_new:false, best_seller:false,
  images: [],
  specifications:[{ key:'', value:'' }],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [modal,    setModal]    = useState(null);   // null | 'add' | 'edit'
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [categories, setCategories] = useState([]);

  // Image upload state
  const [uploading,    setUploading]    = useState(false);
  const [uploadQueue,  setUploadQueue]  = useState([]);  // preview blobs before upload
  const fileInputRef = useRef(null);

  // ── Load products ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search)   params.set('search',   search);
      if (category) params.set('category', category);
      const r = await axios.get(`/api/admin/products?${params}`);
      setProducts(r.data.products || []);
      setTotal(r.data.total   || 0);
      setPages(r.data.pages   || 1);
    } catch { toast.error('Failed to load products'); }
    finally  { setLoading(false); }
  }, [page, search, category]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    axios.get("/api/categories/all")
      .then(r => { if (r.data?.length) setCategories(r.data.map(c => c.name)); })
      .catch(() => {});
  }, []);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY);
    setUploadQueue([]);
    setModal('add');
  };

  const openEdit = (p) => {
    setForm({
      ...p,
      price:          p.price || '',
      sale_price:     p.sale_price || p.salePrice || '',
      images:         Array.isArray(p.images) ? p.images : [],
      specifications: p.specifications?.length ? p.specifications : [{ key:'', value:'' }],
    });
    setUploadQueue([]);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setUploadQueue([]); };

  // ── Image file selection (preview only — upload on save) ──────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const currentTotal = form.images.length + uploadQueue.length;
    const canAdd = 10 - currentTotal;

    if (canAdd <= 0) {
      toast.error('Maximum 10 images per product');
      return;
    }

    const allowed = files.slice(0, canAdd);
    if (files.length > canAdd) toast(`Only ${canAdd} more image(s) allowed — first ${canAdd} selected.`);

    const previews = allowed.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name:    file.name,
    }));
    setUploadQueue(prev => [...prev, ...previews]);
    e.target.value = '';   // reset so same file can be re-selected
  };

  // Remove a queued (not yet uploaded) image
  const removeQueued = (idx) => {
    setUploadQueue(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Remove an already-uploaded image from the form
  const removeUploaded = async (url, idx) => {
    try {
      if (modal === 'edit' && form.id) {
        await axios.delete('/api/upload/image', {
          data: { imageUrl: url, productId: form.id }
        });
      }
      setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
      toast.success('Image removed');
    } catch { toast.error('Failed to remove image'); }
  };

  // ── Upload queued files to Cloudinary via backend ─────────────────────────
  const uploadQueuedImages = async () => {
    if (!uploadQueue.length) return [];
    setUploading(true);
    try {
      const fd = new FormData();
      uploadQueue.forEach(item => fd.append('images', item.file));
      const r = await axios.post('/api/upload/product-images', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadQueue([]);
      return r.data.images || [];
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Save product ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name || !form.description || !form.category) {
      return toast.error('Name, description and category are required');
    }
    setSaving(true);
    try {
      // 1. Upload any pending files first
      const newUrls = await uploadQueuedImages();

      // 2. Build final payload
      const payload = {
        ...form,
        price: form.price_on_request ? null : (parseFloat(form.price) || null),
        sale_price: form.price_on_request || !form.sale_price ? null : (parseFloat(form.sale_price) || null),
        images: [...(form.images || []), ...newUrls],
        specifications: (form.specifications || []).filter(s => s.key),
      };

      if (modal === 'add') {
        const r = await axios.post('/api/admin/products', payload);
        setProducts(prev => [r.data, ...prev]);
        toast.success('Product added');
      } else {
        const r = await axios.put(`/api/admin/products/${form.id}`, payload);
        setProducts(prev => prev.map(p => p.id === form.id ? r.data : p));
        toast.success('Product updated');
      }
      closeModal();
    } catch (err) {
      toast.error(err.message || err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  // ── Delete product ────────────────────────────────────────────────────────
  const deleteProduct = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
  };

  const setF    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setSpec = (i, k, v) => setForm(f => ({
    ...f,
    specifications: f.specifications.map((s, idx) => idx === i ? { ...s, [k]: v } : s),
  }));

  const totalImages = form.images.length + uploadQueue.length;

  return (
    <div>
      <div className="admin-page-header">
        <div><h1>Products</h1><p>{total} products in catalogue</p></div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Product</button>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filters">
            <div className="admin-search-wrap">
              <Search size={15} />
              <input className="admin-search" placeholder="Search by name, brand or category…" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="admin-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th><th>Category</th>
                  <th>Price</th><th>Images</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={6}><div className="admin-empty"><p>No products found</p></div></td></tr>
                ) : products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        {p.images?.[0]
                          ? <img className="td-img" src={p.images[0]} alt={p.name} />
                          : <div className="td-img-placeholder"><ImagePlus size={16} /></div>
                        }
                        <div>
                          <div className="td-name">{p.name}</div>
                          <div className="td-sub">{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-sub">{p.category}</td>
                    <td className="td-bold">
                      {p.price_on_request ? 'On Request' : (
                        p.sale_price
                          ? `KES ${parseFloat(p.sale_price).toLocaleString()}`
                          : `KES ${parseFloat(p.price||0).toLocaleString()}`
                      )}
                    </td>
                    <td>
                      <span className="img-count-badge">{p.images?.length || 0}/10</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className={`badge ${p.in_stock ? 'badge-green' : 'badge-red'}`}>
                          {p.in_stock ? 'In Stock' : 'Out'}
                        </span>
                        {p.featured && <span className="badge badge-yellow">Featured</span>}
                        {p.is_new && <span className="badge badge-dark">New</span>}
                        {p.best_seller && <span className="badge badge-green">Best Seller</span>}
                        {p.sale_price && <span className="badge badge-red">Discounted</span>}
                      </div>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn primary" onClick={() => openEdit(p)} title="Edit"><Edit2 size={14} /></button>
                        <button className="action-btn danger"  onClick={() => deleteProduct(p.id, p.name)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-pagination">
          <span>Showing {products.length} of {total}</span>
          <div className="admin-page-btns">
            <button className="admin-page-btn" disabled={page<=1} onClick={() => setPage(p=>p-1)}><ChevronLeft size={14}/></button>
            {[...Array(Math.min(pages,5))].map((_,i) => (
              <button key={i} className={`admin-page-btn${page===i+1?' active':''}`} onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="admin-page-btn" disabled={page>=pages} onClick={() => setPage(p=>p+1)}><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Modal ───────────────────────────────────────────────── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal product-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{modal === 'add' ? 'Add New Product' : `Edit — ${form.name}`}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>

            <div className="admin-modal-body">
              {/* ── Image Upload Section ──────────────────────────────────── */}
              <div className="modal-section">
                <h4>
                  Product Images
                  <span className="img-count-label">
                    {totalImages}/10 uploaded
                  </span>
                </h4>

                {/* Existing uploaded images */}
                <div className="img-grid">
                  {form.images.map((url, i) => (
                    <div key={url} className="img-thumb">
                      <img src={url} alt={`Product image ${i+1}`} />
                      <div className="img-thumb-overlay">
                        <span className="img-thumb-num">#{i+1}</span>
                        <button
                          className="img-thumb-remove"
                          onClick={() => removeUploaded(url, i)}
                          title="Remove image"
                        ><X size={14} /></button>
                      </div>
                    </div>
                  ))}

                  {/* Queued (pending upload) previews */}
                  {uploadQueue.map((item, i) => (
                    <div key={item.preview} className="img-thumb img-thumb--queued">
                      <img src={item.preview} alt={item.name} />
                      <div className="img-thumb-overlay">
                        <span className="img-thumb-badge">Pending</span>
                        <button
                          className="img-thumb-remove"
                          onClick={() => removeQueued(i)}
                          title="Cancel"
                        ><X size={14} /></button>
                      </div>
                    </div>
                  ))}

                  {/* Add more slot */}
                  {totalImages < 10 && (
                    <button
                      className="img-add-slot"
                      onClick={() => fileInputRef.current?.click()}
                      title="Add images"
                    >
                      <Upload size={22} />
                      <span>Add Photo</span>
                      <span className="img-add-hint">{10 - totalImages} remaining</span>
                    </button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                <p className="img-hint">
                  Max 10 photos · JPEG, PNG or WebP · Up to 5 MB each · First image = cover photo
                </p>

                {uploading && (
                  <div className="img-uploading">
                    <Loader size={16} className="spin" />
                    Uploading images to cloud…
                  </div>
                )}
              </div>

              {/* ── Product fields ────────────────────────────────────────── */}
              <div className="modal-section">
                <h4>Product Details</h4>
                <div className="product-form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" value={form.name}
                      onChange={e => setF('name', e.target.value)}
                      placeholder="e.g. Hematology Analyzer BC-6800" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" value={form.category}
                      onChange={e => setF('category', e.target.value)}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Description *</label>
                    <textarea className="form-textarea" rows={3} value={form.description}
                      onChange={e => setF('description', e.target.value)}
                      placeholder="Full product description…" />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Short Description</label>
                    <input className="form-input" value={form.short_description}
                      onChange={e => setF('short_description', e.target.value)}
                      placeholder="One-line summary shown on product cards" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input className="form-input" value={form.brand}
                      onChange={e => setF('brand', e.target.value)}
                      placeholder="e.g. Mindray" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country of Origin</label>
                    <input className="form-input" value={form.origin}
                      onChange={e => setF('origin', e.target.value)}
                      placeholder="e.g. China" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (KES)</label>
                    <input className="form-input" type="number" value={form.price}
                      onChange={e => setF('price', e.target.value)}
                      placeholder="0.00"
                      disabled={form.price_on_request} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Discounted Price (KES)</label>
                    <input className="form-input" type="number" value={form.sale_price}
                      onChange={e => setF('sale_price', e.target.value)}
                      placeholder="Optional sale price"
                      disabled={form.price_on_request} />
                    {!form.price_on_request && form.price && form.sale_price && parseFloat(form.sale_price) < parseFloat(form.price) && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--grey)', marginTop: 6 }}>
                        Discount: {Math.round(((parseFloat(form.price) - parseFloat(form.sale_price)) / parseFloat(form.price)) * 100)}%
                      </p>
                    )}
                  </div>
                  <div className="form-group toggles-col">
                    <label className="filter-check">
                      <input type="checkbox" checked={form.price_on_request}
                        onChange={e => setF('price_on_request', e.target.checked)} />
                      Price on Request
                    </label>
                    <label className="filter-check">
                      <input type="checkbox" checked={form.in_stock}
                        onChange={e => setF('in_stock', e.target.checked)} />
                      In Stock
                    </label>
                    <label className="filter-check">
                      <input type="checkbox" checked={form.featured}
                        onChange={e => setF('featured', e.target.checked)} />
                      Featured Product
                    </label>
                    <label className="filter-check">
                      <input type="checkbox" checked={form.is_new}
                        onChange={e => setF('is_new', e.target.checked)} />
                      New Arrival
                    </label>
                    <label className="filter-check">
                      <input type="checkbox" checked={form.best_seller}
                        onChange={e => setF('best_seller', e.target.checked)} />
                      Best Seller
                    </label>
                  </div>
                </div>
              </div>

              {/* ── Specifications ────────────────────────────────────────── */}
              <div className="modal-section">
                <h4>Technical Specifications</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {(form.specifications || []).map((s, i) => (
                    <div key={i} className="spec-row">
                      <input className="form-input" value={s.key}
                        onChange={e => setSpec(i, 'key', e.target.value)}
                        placeholder="Property (e.g. Throughput)" />
                      <input className="form-input" value={s.value}
                        onChange={e => setSpec(i, 'value', e.target.value)}
                        placeholder="Value (e.g. 60 samples/hr)" />
                      <button type="button" className="action-btn danger"
                        onClick={() => setF('specifications', form.specifications.filter((_,idx) => idx !== i))}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline btn-sm" style={{ alignSelf:'flex-start' }}
                    onClick={() => setF('specifications', [...(form.specifications||[]), { key:'', value:'' }])}>
                    <Plus size={13} /> Add Specification
                  </button>
                </div>
              </div>

              {/* ── Actions ───────────────────────────────────────────────── */}
              <div style={{ display:'flex', gap:10, paddingTop:8 }}>
                <button className="btn btn-primary" onClick={handleSave}
                  disabled={saving || uploading}>
                  {saving || uploading
                    ? <><Loader size={15} className="spin" /> {uploading ? 'Uploading…' : 'Saving…'}</>
                    : <><Save size={15} /> {modal === 'add' ? 'Add Product' : 'Save Changes'}</>
                  }
                </button>
                <button className="btn btn-outline" onClick={closeModal}
                  disabled={saving || uploading}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
