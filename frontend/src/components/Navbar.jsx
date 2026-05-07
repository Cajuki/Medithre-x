import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, User, Menu, X, ChevronDown, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [userOpen, setUserOpen]         = useState(false);
  const [categories, setCategories]     = useState([]);
  const productsTimer = useRef(null);
  const userTimer     = useRef(null);
  const { user, logout } = useAuth();
  const { count }        = useCart();
  const location         = useLocation();
  const navigate         = useNavigate();
  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/categories', label: 'Categories' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/quotes', label: 'Quotes' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/messages', label: 'Messages' },
    { to: '/admin/settings', label: 'Settings' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    axios.get('/api/categories')
      .then(({ data }) => setCategories(data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => { setMenuOpen(false); setProductsOpen(false); setUserOpen(false); }, [location]);

  // Products dropdown hover with delay so it doesn't snap shut
  const openProducts  = () => { clearTimeout(productsTimer.current); setProductsOpen(true); };
  const closeProducts = () => { productsTimer.current = setTimeout(() => setProductsOpen(false), 150); };

  const openUser  = () => { clearTimeout(userTimer.current); setUserOpen(true); };
  const closeUser = () => { userTimer.current = setTimeout(() => setUserOpen(false), 150); };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div className="navbar-topbar">
        <div className="container">
          <span><Phone size={12} /> 0790 080 903</span>
          <span>Mon – Fri: 8:00 AM – 6:00 PM EAT</span>
          <span>📍 Nairobi CBD, Pramukh Plaza — Shop 19</span>
        </div>
      </div>

      {/* ── Main nav ────────────────────────────────────────────────────────── */}
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-text">MEDITHREX</span>
            <span className="logo-sub">MEDICAL SOLUTIONS</span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar-links">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            </li>

            {/* Products mega-dropdown */}
            <li className="has-dropdown" onMouseEnter={openProducts} onMouseLeave={closeProducts}>
              <Link to="/products" className={location.pathname.startsWith('/products') ? 'active' : ''}>
                Products <ChevronDown size={14} className={`chevron${productsOpen ? ' open' : ''}`} />
              </Link>

              {productsOpen && (
                <div className="dropdown mega-dropdown" onMouseEnter={openProducts} onMouseLeave={closeProducts}>
                  <div className="mega-inner">
                    <div className="mega-header">
                      <Link to="/products" className="mega-all-link">
                        View All Products
                        <span className="mega-all-arrow">→</span>
                      </Link>
                      <p>Browse our complete catalogue of medical &amp; laboratory equipment</p>
                    </div>
                    <div className="mega-grid">
                      {categories.map(cat => (
                        <Link
                          key={cat.name}
                          to={`/products?category=${encodeURIComponent(cat.name)}`}
                          className="mega-item"
                        >
                          <span className="mega-item-name">{cat.name}</span>
                          <span className="mega-item-desc">{cat.description || 'Browse products in this category'}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="mega-footer">
                      <Link to="/quote" className="btn btn-primary btn-sm">Request a Quote</Link>
                      <Link to="/contact" className="btn btn-outline btn-sm">Talk to Sales</Link>
                    </div>
                  </div>
                </div>
              )}
            </li>

            <li><Link to="/quote"   className={location.pathname === '/quote'   ? 'active' : ''}>Request Quote</Link></li>
            <li><Link to="/about"   className={location.pathname === '/about'   ? 'active' : ''}>About</Link></li>
            <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link></li>
          </ul>

          {/* Actions */}
          <div className="navbar-actions">
            <Link to="/cart" className="cart-btn" aria-label="Cart">
              <ShoppingCart size={20} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>

            {user ? (
              <div className="user-menu" onMouseEnter={openUser} onMouseLeave={closeUser}>
                <button className="user-btn" onClick={() => setUserOpen(o => !o)}>
                  <User size={18} />
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown size={13} className={`chevron${userOpen ? ' open' : ''}`} />
                </button>
                {userOpen && (
                  <div className="user-dropdown" onMouseEnter={openUser} onMouseLeave={closeUser}>
                    {user.role === 'admin' ? (
                      <>
                        <Link to="/admin" className="admin-dash-link">⚡ Admin Dashboard</Link>
                        {adminLinks.slice(1).map((link) => (
                          <Link key={link.to} to={link.to}>{link.label}</Link>
                        ))}
                      </>
                    ) : (
                      <>
                        <Link to="/account">My Account</Link>
                        <Link to="/account/orders">My Orders</Link>
                        <Link to="/account/quotes">My Quotes</Link>
                      </>
                    )}
                    <hr />
                    <button onClick={handleLogout}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
            )}

            <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ─────────────────────────────────────────────────── */}
        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/">Home</Link>
            <div className="mobile-section-label">Products</div>
            <Link to="/products" className="mobile-view-all">All Products →</Link>
            {categories.map(cat => (
              <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`} className="mobile-sub">
                {cat.name}
              </Link>
            ))}
            <Link to="/quote">Request Quote</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <div className="mobile-divider" />
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    {adminLinks.map((link) => (
                      <Link key={link.to} to={link.to} className={link.to === '/admin' ? 'mobile-admin' : ''}>{link.label}</Link>
                    ))}
                  </>
                ) : (
                  <Link to="/account">My Account</Link>
                )}
                <button onClick={handleLogout} className="mobile-logout">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link to="/register">Create Account</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
