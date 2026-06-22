import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './AdminPages.css';

const STATUSES = ['New', 'Reviewed', 'Quoted', 'Accepted', 'Declined'];
const STATUS_COLORS = {
  New: '#F59E0B',
  Reviewed: '#3B82F6',
  Quoted: '#8B5CF6',
  Accepted: '#10B981',
  Declined: '#EF4444',
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    quoted_price: '',
    admin_notes: '',
  });
  const [updating, setUpdating] = useState(false);
  const abortControllerRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load quotes with abort support
  const load = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (status) params.set('status', status);

      const r = await axios.get(`/api/admin/quotes?${params}`, {
        signal: controller.signal,
      });
      setQuotes(r.data.quotes);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log('Request cancelled');
        return;
      }
      console.error('Load error:', err);
      toast.error(err.response?.data?.message || 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    load();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [load]);

  const openQuote = async (id) => {
    try {
      const r = await axios.get(`/api/admin/quotes/${id}`);
      setSelected(r.data);
      setUpdateForm({
        status: r.data.status,
        quoted_price: r.data.quoted_price || '',
        admin_notes: r.data.admin_notes || '',
      });
    } catch (err) {
      console.error('Open quote error:', err);
      toast.error('Failed to load quote details');
    }
  };

  const submitUpdate = async () => {
    // Validate price
    const priceRaw = updateForm.quoted_price.trim();
    if (priceRaw !== '' && isNaN(Number(priceRaw))) {
      toast.error('Please enter a valid number for the quoted price');
      return;
    }

    setUpdating(true);
    const payload = {
      ...updateForm,
      quoted_price: priceRaw === '' ? null : Number(priceRaw),
    };

    try {
      await axios.put(`/api/admin/quotes/${selected.id}`, payload);
      toast.success('Quote updated successfully');
      load();
      setSelected(null);
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Pagination range with ellipsis
  const getPageRange = () => {
    const delta = 2;
    const range = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(pages - 1, page + delta);
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    if (pages <= 1) return [1];
    const result = [1];
    if (left > 2) result.push('…');
    result.push(...range);
    if (right < pages - 1) result.push('…');
    if (pages > 1) result.push(pages);
    return result;
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Quote Requests</h1>
          <p>{total} total quotes</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-filters">
            <div className="admin-search-wrap">
              <Search size={15} />
              <input
                className="admin-search"
                placeholder="Search by quote #, name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="admin-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner" />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>County</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="admin-empty">
                        <p>No quotes found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  quotes.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <span className="td-bold">{q.quote_number}</span>
                      </td>
                      <td>
                        <div className="td-name">{q.name}</div>
                        <div className="td-sub">{q.email}</div>
                      </td>
                      <td className="td-sub">{q.company || '—'}</td>
                      <td className="td-sub">{q.county || '—'}</td>
                      <td className="td-center">—</td>
                      <td>
                        <span
                          className="status-pill"
                          style={{
                            background: STATUS_COLORS[q.status] + '20',
                            color: STATUS_COLORS[q.status],
                            border: `1px solid ${STATUS_COLORS[q.status]}50`,
                          }}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="td-date">
                        {new Date(q.created_at).toLocaleDateString('en-KE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="action-btn primary"
                            onClick={() => openQuote(q.id)}
                            title="View & Update"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-pagination">
          <span>
            Showing {quotes.length} of {total}
          </span>
          <div className="admin-page-btns">
            <button
              className="admin-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            {getPageRange().map((p, idx) =>
              p === '…' ? (
                <span key={idx} className="admin-page-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={idx}
                  className={`admin-page-btn${page === p ? ' active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              className="admin-page-btn"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Quote Detail Modal */}
      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Quote {selected.quote_number}</h3>
                <p>{new Date(selected.created_at).toLocaleString('en-KE')}</p>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="modal-section">
                <h4>Customer Details</h4>
                <div className="modal-grid-2">
                  <div>
                    <label>Name</label>
                    <p>{selected.name}</p>
                  </div>
                  <div>
                    <label>Email</label>
                    <p>{selected.email}</p>
                  </div>
                  <div>
                    <label>Phone</label>
                    <p>{selected.phone}</p>
                  </div>
                  <div>
                    <label>Company</label>
                    <p>{selected.company || '—'}</p>
                  </div>
                  <div>
                    <label>County</label>
                    <p>{selected.county || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4>Requested Equipment</h4>
                <div className="modal-items">
                  {selected.items?.map((item, i) => (
                    <div key={i} className="modal-item-row">
                      <span className="modal-item-name">{item.product_name}</span>
                      <span className="modal-item-qty">× {item.quantity}</span>
                      {item.notes && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--grey)',
                            fontStyle: 'italic',
                          }}
                        >
                          {item.notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selected.message && (
                <div className="modal-section">
                  <h4>Customer Message</h4>
                  <p className="modal-notes">{selected.message}</p>
                </div>
              )}

              <div className="modal-section">
                <h4>Respond to Quote</h4>
                <div className="modal-grid-2">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={updateForm.status}
                      onChange={(e) =>
                        setUpdateForm((f) => ({ ...f, status: e.target.value }))
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quoted Price (KES)</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. 485000"
                      value={updateForm.quoted_price}
                      onChange={(e) =>
                        setUpdateForm((f) => ({
                          ...f,
                          quoted_price: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Admin Notes (internal)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={updateForm.admin_notes}
                    onChange={(e) =>
                      setUpdateForm((f) => ({
                        ...f,
                        admin_notes: e.target.value,
                      }))
                    }
                    placeholder="Internal notes, price breakdown, availability..."
                  />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={submitUpdate}
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Response'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}