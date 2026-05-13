import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Users, MessageSquare, LogOut, Menu, X,
  ChevronRight, Settings, Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import './AdminLayout.css';

const NAV = [
  { to: '/admin',            label: 'Dashboard',   icon: <LayoutDashboard size={18} />, end: true },
  { to: '/admin/categories', label: 'Categories',  icon: <Tag size={18} /> },
  { to: '/admin/products',   label: 'Products',    icon: <Package size={18} /> },
  { to: '/admin/orders',     label: 'Orders',      icon: <ShoppingCart size={18} /> },
  { to: '/admin/quotes',     label: 'Quotes',      icon: <FileText size={18} /> },
  { to: '/admin/users',      label: 'Users',       icon: <Users size={18} /> },
  { to: '/admin/messages',   label: 'Messages',    icon: <MessageSquare size={18} /> },
  { to: '/admin/settings',   label: 'Settings',    icon: <Settings size={18} /> },
];

export default function AdminLayout() {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`admin-shell${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="admin-sidebar-head">
          <div className="admin-brand">
            <span className="admin-brand-text">medithrex</span>
            {!collapsed && <span className="admin-brand-sub">ADMIN PANEL</span>}
          </div>
          <button className="sidebar-collapse-btn desktop-only" onClick={() => setCollapsed(!collapsed)}>
            <ChevronRight size={16} className={collapsed ? '' : 'rotated'} />
          </button>
        </div>

        <nav className="admin-nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {!collapsed && <span className="admin-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {!collapsed && (
            <div className="admin-user-info">
              <div className="admin-user-avatar">{user?.name?.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong>{user?.name?.split(' ')[0]}</strong>
                <span>Administrator</span>
              </div>
            </div>
          )}
          <button className="admin-logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="admin-topbar-right" style={{ marginLeft: 'auto' }}>
            <a href="/" target="_blank" rel="noreferrer" className="topbar-site-btn">View Site ↗</a>
            <div className="topbar-avatar">{user?.name?.slice(0, 2).toUpperCase()}</div>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
