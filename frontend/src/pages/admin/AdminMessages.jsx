import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Trash2, CheckCircle, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import './AdminPages.css';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filter !== '') params.set('is_read', filter);
      const r = await axios.get(`/api/admin/messages?${params}`);
      setMessages(r.data.messages); setTotal(r.data.total); setPages(r.data.pages);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await axios.put(`/api/admin/messages/${id}/read`);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
      toast.success('Marked as read');
    } catch { toast.error('Failed to update'); }
  };

  const deleteMsg = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await axios.delete(`/api/admin/messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
     <>
       <div className="admin-page-header">
        <div><h1>Contact Messages</h1><p>{total} total messages</p></div>
      </div>

      {/* Filter tabs */}
      <div className="msg-filter-tabs">
        {[['', 'All'], ['false', 'Unread'], ['true', 'Read']].map(([val, label]) => (
          <button key={val} className={`msg-tab${filter === val ? ' active' : ''}`}
            onClick={() => { setFilter(val); setPage(1); }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? <div className="admin-loading"><div className="spinner" /></div> : (
        <>
          {messages.length === 0 ? (
            <div className="admin-empty" style={{ marginTop: 24 }}>
              <Mail size={48} strokeWidth={1} />
              <h4>No Messages</h4>
              <p>Contact form submissions will appear here.</p>
            </div>
          ) : (
            <div className="msgs-grid" style={{ marginTop: 20 }}>
              {messages.map(m => (
                <div key={m.id} className={`msg-card${!m.is_read ? ' unread' : ''}`}>
                  <div className="msg-card-header">
                    <div>
                      <h4>{m.subject || 'General Enquiry'}</h4>
                      <div className="msg-card-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Mail size={12} /> {m.name} — {m.email}
                        </span>
                        {m.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} /> {m.phone}</span>}
                        <span>{new Date(m.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {!m.is_read && <span className="badge badge-yellow">Unread</span>}
                      </div>
                    </div>
                    <div className="msg-actions">
                      {!m.is_read && (
                        <button className="action-btn primary" title="Mark as read" onClick={() => markRead(m.id)}>
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <a href={`mailto:${m.email}`} className="action-btn primary" title="Reply">
                        <Mail size={16} />
                      </a>
                      <button className="action-btn danger" title="Delete" onClick={() => deleteMsg(m.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="msg-card-body">{m.message}</div>
                </div>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="admin-pagination" style={{ marginTop: 16, background: 'var(--white)', border: '1.5px solid var(--white-3)', borderRadius: 8, padding: '14px 20px' }}>
              <span>Showing {messages.length} of {total}</span>
              <div className="admin-page-btns">
                <button className="admin-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></button>
                {[...Array(Math.min(pages, 5))].map((_, i) => (
                  <button key={i} className={`admin-page-btn${page === i + 1 ? ' active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="admin-page-btn" disabled={page >= pages} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </>
       )}
     </>
  );
}
