import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, X, Shield, User, Mail, Phone, Building2, MapPin, Calendar, Clock, Package, FileText } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      if (role)   params.set('role', role);
      const r = await axios.get(`/api/admin/users?${params}`);
      setUsers(r.data.users); setTotal(r.data.total); setPages(r.data.pages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, role]);

  useEffect(() => { load(); }, [load]);

  const openUser = async (id) => {
    try {
      const r = await axios.get(`/api/admin/users/${id}`);
      setSelected(r.data);
    } catch { toast.error('Failed to load user'); }
  };

  const updateRole = async (userId, newRole) => {
    try {
      const user = users.find(u => u.id === userId);
      await axios.put(`/api/admin/users/${userId}`, { ...user, role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      if (selected?.id === userId) setSelected(prev => ({ ...prev, role: newRole }));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      setSelected(null);
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-charcoal">Users</h1>
          <p className="text-sm text-charcoal-400 mt-1">{total} registered accounts</p>
        </div>
      </div>

      {/* Filters & Table Card */}
      <div className="premium-card overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              className="form-input pl-9"
              placeholder="Search by name, email, company..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="form-select w-auto" value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="user">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-section/50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Company</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">County</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Role</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-charcoal-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center py-16 text-charcoal-400">
                        <User size={36} className="mb-3 text-charcoal-200" />
                        <p className="text-sm">No users found</p>
                      </div>
                    </td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-section/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {u.name?.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-charcoal">{u.name}</p>
                          <p className="text-[10px] text-charcoal-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal-400">{u.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-charcoal-400">{u.company || '—'}</td>
                    <td className="px-4 py-3 text-xs text-charcoal-400">{u.county || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-primary-100 text-primary border border-primary/20'
                          : 'bg-section text-charcoal-400 border border-border'
                      }`}>
                        {u.role === 'admin' ? <Shield size={10} /> : null}
                        {u.role === 'admin' ? 'Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-charcoal-400 text-right">
                      {new Date(u.created_at).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openUser(u.id)} className="p-1.5 rounded-md text-charcoal-400 hover:text-primary hover:bg-primary-50 transition-all" title="View">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-md text-charcoal-400 hover:text-danger hover:bg-danger-light/30 transition-all" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-charcoal-400">Showing {users.length} of {total}</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md border border-border text-charcoal-400 hover:bg-section disabled:opacity-40 transition-all" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={14} />
            </button>
            {[...Array(Math.min(pages,5))].map((_,i) => (
              <button key={i}
                className={`min-w-[32px] h-8 rounded-md text-xs font-semibold transition-all ${
                  page === i+1 ? 'bg-primary text-white' : 'border border-border text-charcoal-600 hover:bg-section'
                }`}
                onClick={() => setPage(i+1)}>{i+1}</button>
            ))}
            <button className="p-1.5 rounded-md border border-border text-charcoal-400 hover:bg-section disabled:opacity-40 transition-all" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-lg font-bold flex items-center justify-center">
                    {selected.name?.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-charcoal">{selected.name}</h3>
                    <p className="text-xs text-charcoal-400">{selected.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-md text-charcoal-400 hover:text-charcoal hover:bg-section transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Account Info */}
                <div>
                  <h4 className="text-sm font-bold text-charcoal mb-3">Account Information</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-section rounded-lg">
                      <Phone size={15} className="text-charcoal-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-charcoal-400 font-medium">Phone</p>
                        <p className="text-xs font-semibold text-charcoal">{selected.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-section rounded-lg">
                      <Building2 size={15} className="text-charcoal-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-charcoal-400 font-medium">Company</p>
                        <p className="text-xs font-semibold text-charcoal">{selected.company || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-section rounded-lg">
                      <MapPin size={15} className="text-charcoal-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-charcoal-400 font-medium">County</p>
                        <p className="text-xs font-semibold text-charcoal">{selected.county || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-section rounded-lg">
                      <Calendar size={15} className="text-charcoal-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-charcoal-400 font-medium">Joined</p>
                        <p className="text-xs font-semibold text-charcoal">
                          {new Date(selected.created_at).toLocaleDateString('en-KE', { day:'numeric', month:'long', year:'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Management */}
                <div>
                  <h4 className="text-sm font-bold text-charcoal mb-3">Role Management</h4>
                  <div className="flex items-center gap-3">
                    <button
                      className={`btn btn-sm ${selected.role === 'user' ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => updateRole(selected.id, 'user')}
                    >
                      <User size={13} /> Customer
                    </button>
                    <button
                      className={`btn btn-sm ${selected.role === 'admin' ? 'btn-dark' : 'btn-outline'}`}
                      onClick={() => updateRole(selected.id, 'admin')}
                    >
                      <Shield size={13} /> Admin
                    </button>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h4 className="text-sm font-bold text-charcoal mb-3">Order History ({selected.orders?.length || 0})</h4>
                  {selected.orders?.length === 0 ? (
                    <p className="text-xs text-charcoal-400">No orders placed</p>
                  ) : (
                    <div className="space-y-2">
                      {selected.orders?.slice(0,5).map(o => (
                        <div key={o.id} className="flex items-center justify-between p-3 bg-section rounded-lg text-xs">
                          <div className="flex items-center gap-2">
                            <Package size={13} className="text-charcoal-400" />
                            <span className="font-semibold text-charcoal">{o.order_number}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-charcoal-400">{o.status}</span>
                            <span className="font-semibold text-charcoal">KES {parseFloat(o.total_amount||0).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quote History */}
                <div>
                  <h4 className="text-sm font-bold text-charcoal mb-3">Quote History ({selected.quotes?.length || 0})</h4>
                  {selected.quotes?.length === 0 ? (
                    <p className="text-xs text-charcoal-400">No quotes submitted</p>
                  ) : (
                    <div className="space-y-2">
                      {selected.quotes?.slice(0,5).map(q => (
                        <div key={q.id} className="flex items-center justify-between p-3 bg-section rounded-lg text-xs">
                          <div className="flex items-center gap-2">
                            <FileText size={13} className="text-charcoal-400" />
                            <span className="font-semibold text-charcoal">{q.quote_number}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-charcoal-400">{q.status}</span>
                            <span className="text-charcoal-400">{new Date(q.created_at).toLocaleDateString('en-KE')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete */}
                <button
                  className="btn btn-outline btn-sm text-danger border-danger hover:bg-danger-light/30"
                  onClick={() => deleteUser(selected.id)}
                >
                  <Trash2 size={13} /> Delete User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}