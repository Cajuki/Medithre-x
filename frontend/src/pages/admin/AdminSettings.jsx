import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { isValidKenyanPhone, normalizeKenyanPhone, KENYAN_PHONE_HINT } from '../../utils/validation.js';
import { Save, Lock, RefreshCw, Phone, Mail, Globe } from 'lucide-react';
import './AdminPages.css';

export default function AdminSettings() {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', company: user?.company || '' });
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (profile.phone && !isValidKenyanPhone(profile.phone)) return toast.error(KENYAN_PHONE_HINT);
    setSaving(true);
    try {
      await updateProfile({ ...profile, phone: profile.phone ? normalizeKenyanPhone(profile.phone) : '' });
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPw !== pw.confirm) return toast.error('Passwords do not match');
    if (pw.newPw.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPw(true);
    try {
      await axios.put('/api/auth/password', { currentPassword: pw.current, newPassword: pw.newPw });
      toast.success('Password changed successfully');
      setPw({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div><h1>Settings</h1><p>Manage your admin profile and system configuration.</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Admin Profile */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>Admin Profile</h3></div>
          <form onSubmit={saveProfile} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" inputMode="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="0790 080 903" />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" value={profile.company} onChange={e => setProfile(p => ({ ...p, company: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>Change Password</h3></div>
          <form onSubmit={changePassword} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-input" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={pw.newPw} onChange={e => setPw(p => ({ ...p, newPw: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-dark" disabled={savingPw} style={{ alignSelf: 'flex-start' }}>
              <Lock size={15} /> {savingPw ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* System Info */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>System Information</h3></div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Platform', value: 'Medithrex v1.0.0' },
              { label: 'Database', value: 'PostgreSQL' },
              { label: 'Frontend', value: 'React 18 + Vite 5' },
              { label: 'Backend', value: 'Node.js + Express 4' },
              { label: 'Auth', value: 'JWT (7-day expiry)' },
              { label: 'Environment', value: import.meta.env.MODE },
            ].map(item => (
              <div key={item.label} className="settings-info-row">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="admin-card">
          <div className="admin-card-header"><h3>Business Contact Info</h3></div>
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="settings-contact-row">
              <div className="settings-contact-icon"><Phone size={18} /></div>
              <div>
                <label>Phone / WhatsApp</label>
                <p>0790 080 903</p>
              </div>
            </div>
            <div className="settings-contact-row">
              <div className="settings-contact-icon"><Mail size={18} /></div>
              <div>
                <label>Email</label>
                <p>info@medithrex.co.ke</p>
              </div>
            </div>
            <div className="settings-contact-row">
              <div className="settings-contact-icon"><Globe size={18} /></div>
              <div>
                <label>Location</label>
                <p>Nairobi, Kenya — Serving all 47 counties</p>
              </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--grey)' }}>
              To update these details, edit the Footer and Contact components in the frontend source code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
