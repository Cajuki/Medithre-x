import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, User, Menu, X, ChevronDown, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { BUSINESS_LOCATION, PRIMARY_PHONE, SECONDARY_PHONE } from '../config/contact.js';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const productsTimer = useRef(null);
  const userTimer = useRef(null);

  const { user, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

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

  useEffect(() => {
    setMenuOpen(false);
    setProductsOpen(false);
    setUserOpen(false);
  }, [location]);

  const openProducts = () => {
    clearTimeout(productsTimer.current);
    setProductsOpen(true);
  };

  const closeProducts = () => {
    productsTimer.current = setTimeout(() => setProductsOpen(false), 150);
  };

  const openUser = () => {
    clearTimeout(userTimer.current);
    setUserOpen(true);
  };

  const closeUser = () => {
    userTimer.current = setTimeout(() => setUserOpen(false), 150);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Topbar */}
      <div className="navbar-topbar">
        <div className="container">
          <span><Phone size={12} /> {PRIMARY_PHONE.display} / {SECONDARY_PHONE.display}</span>
          <span>Mon – Fri: 8:00 AM – 6:00 PM EAT</span>
          <span>📍 Nairobi CBD, {BUSINESS_LOCATION}</span>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-wordmark">medithrex</span>
          </Link>

          {/* Links */}
          <ul className="navbar-links">
            <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>

            <li
              className="has-dropdown"
              onMouseEnter={openProducts}
              onMouseLeave={closeProducts}
            >
              <Link to="/products">
                Products <ChevronDown size={14} />
              </Link>

              {productsOpen && (
                <div className="dropdown mega-dropdown">
                  <div className="mega-inner">
                    <div className="mega-header">
                      <Link to="/products">View All Products →</Link>
                      <p>Browse our catalogue</p>
                    </div>

                    <div className="mega-grid">
                      {categories.map(cat => (
                        <Link
                          key={cat.name}
                          to={`/products?category=${encodeURIComponent(cat.name)}`}
                          className="mega-item"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </li>

            <li><Link to="/quote">Request Quote</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>

          {/* Actions */}
          <div className="navbar-actions">

            {user ? (
              <div
                className="user-menu"
                onMouseEnter={openUser}
                onMouseLeave={closeUser}
              >
                <button className="user-btn" onClick={() => setUserOpen(o => !o)}>
                  <User size={18} />
                  <span>{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={13} />
                </button>

                {userOpen && (
                  <div className="user-dropdown">
                    {user.role === 'admin' ? (
                      <>
                        <Link to="/admin">Dashboard</Link>
                        {adminLinks.slice(1).map(link => (
                          <Link key={link.to} to={link.to}>{link.label}</Link>
                        ))}
                      </>
                    ) : (
                      <>
                        <Link to="/account">My Account</Link>
                        <Link to="/account/orders">Orders</Link>
                        <Link to="/account/quotes">Quotes</Link>
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

            <Link to="/cart" className="cart-btn">
              <ShoppingCart size={20} />
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>

            <button
              className="mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/quote">Request Quote</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>

            <hr />

            {user ? (
              <>
                <Link to="/account">My Account</Link>
                <button onClick={handleLogout}>Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}