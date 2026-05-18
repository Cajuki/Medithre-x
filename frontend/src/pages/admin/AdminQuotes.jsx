import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Printer
} from 'lucide-react';
import './AdminPages.css';

const STATUSES = ['New', 'Reviewed', 'Quoted', 'Accepted', 'Declined'];

const STATUS_COLORS = {
  New: '#F59E0B',
  Reviewed: '#3B82F6',
  Quoted: '#8B5CF6',
  Accepted: '#10B981',
  Declined: '#EF4444'
};

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [selected, setSelected] = useState(null);

  const [updateForm, setUpdateForm] = useState({
    status: '',
    quoted_price: '',
    admin_notes: '',
    response_message: ''
  });

  const [updating, setUpdating] = useState(false);

  // ─────────────────────────────
  // LOAD QUOTES
  // ─────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });

      if (search) params.set('search', search);
      if (status) params.set('status', status);

      const r = await axios.get(`/api/admin/quotes?${params}`);

      setQuotes(r.data.quotes || []);
      setTotal(r.data.total || 0);
      setPages(r.data.pages || 1);

    } catch (err) {
      console.error(err);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  // ─────────────────────────────
  // OPEN QUOTE
  // ─────────────────────────────
  const openQuote = async (id) => {
    try {
      const r = await axios.get(`/api/admin/quotes/${id}`);

      setSelected(r.data);

      setUpdateForm({
        status: r.data.status || 'New',
        quoted_price: r.data.quoted_price ?? '',
        admin_notes: r.data.admin_notes ?? '',
        response_message: r.data.response_message ?? ''
      });

    } catch (err) {
      console.error(err);
      toast.error('Failed to load quote');
    }
  };

  // ─────────────────────────────
  // PRINT QUOTE
  // ─────────────────────────────
  const printQuote = () => {
    if (!selected) return;

    const price =
      updateForm.quoted_price ||
      selected.quoted_price ||
      'Pending';

    const displayPrice = Number(price);

    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Quote ${selected.quote_number}</title>
          <style>
            body { font-family: Arial; padding: 32px; }
            table { width: 100%; border-collapse: collapse; }
            td, th { border: 1px solid #ddd; padding: 8px; }
          </style>
        </head>
        <body>
          <h1>Quote Response</h1>

          <p><strong>Quote #:</strong> ${selected.quote_number}</p>
          <p><strong>Customer:</strong> ${selected.name}</p>
          <p><strong>Email:</strong> ${selected.email}</p>
          <p><strong>Status:</strong> ${updateForm.status}</p>

          <h3>Items</h3>
          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Notes</th></tr>
            </thead>
            <tbody>
              ${(selected.items || [])
                .map(i => `
                  <tr>
                    <td>${i.productName || i.product_name || ''}</td>
                    <td>${i.quantity}</td>
                    <td>${i.notes || ''}</td>
                  </tr>
                `)
                .join('')}
            </tbody>
          </table>

          <h3>Response</h3>
          <h2>
            ${
              Number.isFinite(displayPrice)
                ? `KES ${displayPrice.toLocaleString()}`
                : price
            }
          </h2>

          <p>
            ${updateForm.response_message ||
              selected.response_message ||
              'Thank you for your request.'}
          </p>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  };

  // ─────────────────────────────
  // FIXED UPDATE (MAIN FIX)
  // ─────────────────────────────
  const submitUpdate = async () => {
    setUpdating(true);

    try {
      const payload = {
        status: updateForm.status,
        admin_notes: updateForm.admin_notes,
        response_message: updateForm.response_message,

        // IMPORTANT FIX (prevents PostgreSQL crash)
        quoted_price:
          updateForm.quoted_price === '' ||
          updateForm.quoted_price === null ||
          updateForm.quoted_price === undefined
            ? null
            : Number(updateForm.quoted_price)
      };

      const res = await axios.put(
        `/api/admin/quotes/${selected.id}`,
        payload
      );

      toast.success(res.data?.message || 'Quote updated');

      load();
      setSelected(null);

    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div>

      <div className="admin-page-header">
        <div>
          <h1>Quote Requests</h1>
          <p>{total} total quotes</p>
        </div>
      </div>

      <div className="admin-card">

        {/* FILTERS */}
        <div className="admin-card-header">
          <div className="admin-filters">

            <div className="admin-search-wrap">
              <Search size={15} />
              <input
                value={search}
                placeholder="Search quotes..."
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              value={status}
              onChange={e => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              {STATUSES.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>

          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quote</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {quotes.map(q => (
                <tr key={q.id}>
                  <td>{q.quote_number}</td>
                  <td>{q.name}</td>

                  <td>
                    <span
                      style={{
                        color: STATUS_COLORS[q.status],
                        fontWeight: 600
                      }}
                    >
                      {q.status}
                    </span>
                  </td>

                  <td>
                    {new Date(q.created_at).toLocaleDateString()}
                  </td>

                  <td>
                    <button onClick={() => openQuote(q.id)}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* PAGINATION */}
        <div className="admin-pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft />
          </button>

          <span>{page}</span>

          <button
            disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="admin-modal"
            onClick={e => e.stopPropagation()}
          >

            <button onClick={() => setSelected(null)}>
              <X />
            </button>

            <h2>{selected.quote_number}</h2>

            <input
              value={updateForm.quoted_price}
              onChange={e =>
                setUpdateForm(f => ({
                  ...f,
                  quoted_price: e.target.value
                }))
              }
              placeholder="Price"
            />

            <textarea
              value={updateForm.response_message}
              onChange={e =>
                setUpdateForm(f => ({
                  ...f,
                  response_message: e.target.value
                }))
              }
              placeholder="Reply"
            />

            <textarea
              value={updateForm.admin_notes}
              onChange={e =>
                setUpdateForm(f => ({
                  ...f,
                  admin_notes: e.target.value
                }))
              }
              placeholder="Internal notes"
            />

            <button onClick={submitUpdate} disabled={updating}>
              {updating ? 'Saving...' : 'Save'}
            </button>

            <button onClick={printQuote}>
              <Printer /> Print
            </button>

          </div>
        </div>
      )}

    </div>
  );
}