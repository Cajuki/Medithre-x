import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Plus, Edit2, Trash2, X, Save,
  Upload, Loader, Eye, EyeOff,
  GripVertical, ImagePlus, ChevronLeft, ChevronRight
} from 'lucide-react';
import './AdminPages.css';
import './AdminCategories.css';

const EMPTY = { name: '', description: '', sort_order: '0', is_active: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null); // null | 'add' | 'edit'
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);

  // Image state
  const [previewFile,  setPreviewFile]  = useState(null);  // { file, preview }
  const [uploading,    setUploading]    = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await axios.get('/api/categories/all');
      setCategories(r.data || []);
      setTotal(r.data?.length || 0);
    } catch { toast.error('Failed to load categories'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY);
    setPreviewFile(null);
    setModal('add');
  };

  const openEdit = (cat) => {
    setForm({
      id:          cat.id,
      name:        cat.name,
      description: cat.description || '',
      sort_order:  String(cat.sort_order ?? 0),
      is_active:   cat.is_active,
      image_url:   cat.image_url || '',
    });
    setPreviewFile(null);
    setModal('edit');
  };

  const closeModal = () => {
    if (previewFile) URL.revokeObjectURL(previewFile.preview);
    setModal(null);
    setPreviewFile(null);
  };

  // ── File selection ─────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewFile) URL.revokeObjectURL(previewFile.preview);
    setPreviewFile({ file, preview: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const clearImage = () => {
    if (previewFile) URL.revokeObjectURL(previewFile.preview);
    setPreviewFile(null);
    setForm(f => ({ ...f, image_url: '' }));
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      // Build multipart form data (supports file upload)
      const fd = new FormData();
      fd.append('name',        form.name.trim());
      fd.append('description', form.description);
      fd.append('sort_order',  form.sort_order || '0');
      fd.append('is_active',   String(form.is_active));
      if (previewFile?.file) {
        fd.append('image', previewFile.file);
      }

      if (modal === 'add') {
        const r = await axios.post('/api/categories', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCategories(prev => [...prev, r.data].sort((a,b) => a.sort_order - b.sort_order));
        toast.success('Category added');
      } else {
        const r = await axios.put(`/api/categories/${form.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setCategories(prev => prev.map(c => c.id === form.id ? r.data : c));
        toast.success('Category updated');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  // ── Toggle active ──────────────────────────────────────────────────────────
  const toggleActive = async (cat) => {
    try {
      const r = await axios.patch(`/api/categories/${cat.id}/toggle`);
      setCategories(prev => prev.map(c => c.id === cat.id ? r.data : c));
      toast.success(`"${cat.name}" ${r.data.is_active ? 'shown' : 'hidden'}`);
    } catch { toast.error('Failed to update'); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteCategory = async (cat) => {
    const count = parseInt(cat.product_count || 0);
    const msg = count > 0
      ? `Delete "${cat.name}"? It has ${count} product(s) linked. Products will not be deleted but their category link may break.`
      : `Delete "${cat.name}"?`;
    if (!confirm(msg)) return;
    try {
      await axios.delete(`/api/categories/${cat.id}`);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
      toast.success('Category deleted');
    } catch { toast.error('Delete failed'); }
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Current cover image to display in modal
  const currentImage = previewFile?.preview || form.image_url;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Categories</h1>
          <p>{total} categories · shown on the homepage and products page</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* ── Info banner ───────────────────────────────────────────────────── */}
      <div className="cat-info-banner">
        <span>💡</span>
        <p>
          Categories you add here appear as cards on the <strong>homepage</strong>.
          Toggle a category invisible to hide it from users without deleting it.
          Use <strong>Sort Order</strong> (lower = first) to control their display sequence.
        </p>
      </div>

      {/* ── Categories grid ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="admin-loading"><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: 24 }}>
          <ImagePlus size={48} strokeWidth={1} />
          <h4>No Categories Yet</h4>
          <p>Add your first category — it will appear as a card on the homepage.</p>
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={15} /> Add First Category
          </button>
        </div>
      ) : (
        <div className="cat-admin-grid">
          {categories.map(cat => (
            <div key={cat.id} className={`cat-admin-card${!cat.is_active ? ' inactive' : ''}`}>
              {/* Cover image */}
              <div className="cat-admin-img">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} />
                ) : (
                  <div className="cat-admin-no-img">
                    <ImagePlus size={32} />
                    <span>No image</span>
                  </div>
                )}
                {!cat.is_active && (
                  <div className="cat-admin-hidden-badge">Hidden</div>
                )}
              </div>

              {/* Info */}
              <div className="cat-admin-body">
                <div className="cat-admin-meta">
                  <span className="cat-admin-order">#{cat.sort_order}</span>
                  <span className="cat-admin-count">{cat.product_count || 0} products</span>
                </div>
                <h4 className="cat-admin-name">{cat.name}</h4>
                {cat.description && (
                  <p className="cat-admin-desc">{cat.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="cat-admin-actions">
                <button
                  className={`cat-toggle-btn${cat.is_active ? ' active' : ''}`}
                  onClick={() => toggleActive(cat)}
                  title={cat.is_active ? 'Hide from users' : 'Show to users'}
                >
                  {cat.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                  {cat.is_active ? 'Visible' : 'Hidden'}
                </button>
                <button className="action-btn primary" onClick={() => openEdit(cat)} title="Edit">
                  <Edit2 size={15} />
                </button>
                <button className="action-btn danger" onClick={() => deleteCategory(cat)} title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ───────────────────────────────────────────────── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal cat-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{modal === 'add' ? 'Add New Category' : `Edit — ${form.name}`}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>

            <div className="admin-modal-body">
              {/* ── Image Upload ──────────────────────────────────────────── */}
              <div className="modal-section">
                <h4>Category Cover Image</h4>

                <div className="cat-img-upload-area">
                  {currentImage ? (
                    <div className="cat-img-preview">
                      <img src={currentImage} alt="Category cover" />
                      <div className="cat-img-preview-overlay">
                        <button
                          className="cat-img-change-btn"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={16} /> Change Image
                        </button>
                        <button
                          className="cat-img-remove-btn"
                          onClick={clearImage}
                        >
                          <X size={16} /> Remove
                        </button>
                      </div>
                      {previewFile && (
                        <div className="cat-img-pending-badge">Pending upload</div>
                      )}
                    </div>
                  ) : (
                    <button
                      className="cat-img-drop-zone"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={32} />
                      <strong>Click to upload cover image</strong>
                      <span>JPEG, PNG or WebP · Max 5 MB · Recommended 800×600px</span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </div>

              {/* ── Category Details ──────────────────────────────────────── */}
              <div className="modal-section">
                <h4>Category Details</h4>

                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={e => setF('name', e.target.value)}
                    placeholder="e.g. Laboratory Equipment"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={form.description}
                    onChange={e => setF('description', e.target.value)}
                    placeholder="Short description shown on the homepage card"
                    style={{ minHeight: 'auto' }}
                  />
                </div>

                <div className="modal-grid-2">
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={form.sort_order}
                      onChange={e => setF('sort_order', e.target.value)}
                      placeholder="0 = first"
                    />
                    <p style={{ fontSize: '0.72rem', color: 'var(--grey)', marginTop: '4px' }}>
                      Lower numbers appear first on the homepage
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Visibility</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
                      <label className="filter-check">
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          onChange={e => setF('is_active', e.target.checked)}
                        />
                        Show on homepage
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Actions ───────────────────────────────────────────────── */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving || uploading}
                >
                  {saving
                    ? <><Loader size={15} className="spin" /> Saving…</>
                    : <><Save size={15} /> {modal === 'add' ? 'Add Category' : 'Save Changes'}</>
                  }
                </button>
                <button className="btn btn-outline" onClick={closeModal} disabled={saving}>
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
