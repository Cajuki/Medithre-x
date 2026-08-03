import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Users, MessageSquare, LogOut, Menu, X,
  ChevronRight, Settings, Tag, Search, Bell, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../Assets/med.png';
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="admin-area min-h-screen flex">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen z-50 flex flex-col bg-primary-dark border-r border-white/5 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Brand */}
        <div className={`flex items-center gap-3 h-[72px] px-4 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <Link to="/admin" className="flex items-center gap-3 min-w-0">
            <img src={logo} alt="Medithrex" className="h-8 w-auto shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">Medithrex</p>
                <p className="text-[9px] font-semibold text-secondary tracking-[0.2em] uppercase">Admin Panel</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex ml-auto w-7 h-7 items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all shrink-0"
          >
            <ChevronRight size={13} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-white/5 p-3">
          {!collapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-full bg-secondary text-white text-xs font-bold flex items-center justify-center shrink-0">
                {user.name?.slice(0, 2).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name?.split(' ')[0]}</p>
                <p className="text-[10px] text-white/40">Administrator</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-danger hover:bg-danger/10 transition-all w-full ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          {!collapsed && (
            <Link to="/" className="flex items-center justify-center gap-2 mt-2 px-3 py-2 rounded-lg text-xs text-white/30 hover:text-secondary transition-all">
              <BarChart3 size={12} /> View Site
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Main Area ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="admin-topbar-modern sticky top-0 z-30 h-[64px] bg-white border-b border-border flex items-center gap-4 px-4 lg:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border text-charcoal-600 hover:bg-section transition-all"
          >
            <Menu size={18} />
          </button>

          <Link to="/admin" className="lg:hidden flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-auto" />
            <span className="text-sm font-bold text-charcoal">Medithrex</span>
            <span className="text-[8px] font-semibold text-secondary tracking-wider uppercase px-1.5 py-0.5 rounded bg-secondary-50">Admin</span>
          </Link>

          <div className="hidden sm:flex flex-1 max-w-md relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search products, orders, users..."
              className="w-full pl-9 pr-4 py-2 bg-section border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-border text-charcoal-600 hover:bg-section transition-all">
              <Bell size={16} />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-danger text-white text-[7px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <Link
              to="/"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal-600 border border-border rounded-lg hover:bg-section hover:text-primary transition-all"
            >
              <BarChart3 size={13} /> View Site
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold flex items-center justify-center">
              {user?.name?.slice(0, 2).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content-modern flex-1 p-4 lg:p-6 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
