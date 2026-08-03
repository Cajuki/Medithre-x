import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, ShoppingCart, Heart, User, Search, ChevronDown,
  Package, Phone, Mail, Clock, LogOut, Settings, FileText, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { PRIMARY_PHONE, SECONDARY_PHONE, EMAIL } from '../config/contact.js';
import logo from '../Assets/med.png';

const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
  { name: 'Categories', path: '/categories' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Quote', path: '/quote' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex bg-primary-dark/95 backdrop-blur-sm border-b border-white/5">
        <div className="container-custom flex items-center justify-between h-9">
          <div className="flex items-center gap-5 text-[11px] text-white/50">
            <span className="flex items-center gap-1.5"><Phone size={11} /> {PRIMARY_PHONE.display}</span>
            <span className="flex items-center gap-1.5"><Mail size={11} /> {EMAIL}</span>
            <span className="flex items-center gap-1.5"><Clock size={11} /> Mon–Sat: 8AM–6PM</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1.5 text-white/50 hover:text-secondary transition-colors">
                <BarChart3 size={11} /> Admin
              </Link>
            )}
            <Link to="/privacy-policy" className="text-white/50 hover:text-secondary transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="text-white/50 hover:text-secondary transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* ── Main Nav ────────────────────────────────────────────────────── */}
      <nav className={`transition-all duration-300 ${
        scrolled ? 'glass shadow-lg border-b border-border/50' : 'glass shadow-sm'
      }`}>
        <div className="container-custom flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <img src={logo} alt="Medithrex" className="h-9 lg:h-10 w-auto drop-shadow-lg" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight text-charcoal">Medithrex</span>
              <span className="block text-[9px] font-medium text-secondary tracking-[0.2em] uppercase">Medical Equipment</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'text-primary bg-primary-50'
                    : 'text-charcoal hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 text-charcoal">
                {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="relative p-2.5 text-charcoal-600 hover:text-primary hover:bg-section rounded-lg transition-all"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Wishlist — always visible on all screen sizes */}
            <Link to="/wishlist" className="flex p-2.5 text-charcoal-600 hover:text-primary hover:bg-section rounded-lg transition-all relative">
              <Heart size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-secondary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            </Link>

            {/* Cart — badge always visible just like wishlist */}
            <Link to="/cart" className="relative p-2.5 text-charcoal-600 hover:text-primary hover:bg-section rounded-lg transition-all">
              <ShoppingCart size={18} />
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-secondary text-white text-[8px] font-bold rounded-full flex items-center justify-center" aria-label={`${cartCount} items in cart`}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            </Link>

            {/* User Menu */}
{user ? (
               <div className="relative" ref={userMenuRef}>
                 <button
                   onClick={() => setUserMenuOpen(!userMenuOpen)}
                   className="flex items-center gap-2 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                 >
                   <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                     {user.name?.charAt(0)?.toUpperCase() || 'U'}
                   </div>
                   <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <AnimatePresence>
                   {userMenuOpen && (
                     <motion.div
                       initial={{ opacity: 0, y: 8, scale: 0.96 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 8, scale: 0.96 }}
                       transition={{ duration: 0.15 }}
                       className="absolute right-0 top-full mt-2 w-56 glass-card p-1.5"
                     >
                       <div className="px-3 py-2.5 border-b border-border/50 mb-1">
                         <p className="text-sm font-semibold text-charcoal truncate">{user.name}</p>
                         <p className="text-[11px] text-charcoal-400 truncate">{user.email}</p>
                       </div>
                       <Link to="/account" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-charcoal-600 hover:text-charcoal hover:bg-section rounded-md transition-all">
                         <User size={15} /> My Account
                       </Link>
                       <Link to="/account/orders" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-charcoal-600 hover:text-charcoal hover:bg-section rounded-md transition-all">
                         <Package size={15} /> My Orders
                       </Link>
                       <Link to="/account/quotes" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-charcoal-600 hover:text-charcoal hover:bg-section rounded-md transition-all">
                         <FileText size={15} /> My Quotes
                       </Link>
                       <Link to="/account/profile" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-charcoal-600 hover:text-charcoal hover:bg-section rounded-md transition-all">
                         <Settings size={15} /> Settings
                       </Link>
                       {user?.role === 'admin' && (
                         <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-primary hover:bg-primary-50 rounded-md transition-all font-medium">
                           <BarChart3 size={15} /> Admin Dashboard
                         </Link>
                       )}
                       <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-danger hover:bg-danger-light/50 rounded-md transition-all w-full mt-1 border-t border-border/50 pt-2">
                         <LogOut size={15} /> Sign Out
                       </button>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
) : (
                 <div className="hidden sm:flex items-center gap-2">
                   <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-700 shadow-sm hover:shadow-md rounded-lg transition-all duration-200">
                     <User size={15} /> Sign In
                   </Link>
                 </div>
               )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 text-charcoal-600 hover:text-primary hover:bg-section rounded-lg transition-all"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border/50"
            >
              <div className="container-custom py-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
                  <input
                    type="text"
                    placeholder="Search 1,500+ medical products, brands, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-24 py-3.5 border border-border rounded-lg text-charcoal placeholder-charcoal-400 text-sm focus:outline-none focus:border-primary transition-all bg-white"
                    autoFocus
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-700 transition-all">
                    Search
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden glass border-b border-border/50 shadow-xl"
          >
            <div className="container-custom py-4 space-y-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    location.pathname === item.path
                      ? 'text-primary bg-primary-50'
                      : 'text-charcoal-600 hover:text-charcoal hover:bg-section'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
<div className="border-t border-border/50 pt-3 mt-3">
                {!user && (
                  <Link to="/login" className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-700 rounded-lg transition-all w-full">
                    <User size={16} /> Sign In
                  </Link>
                )}
                <div className="flex items-center gap-3 px-4 py-3 text-xs text-charcoal-400">
                  <span className="flex items-center gap-1"><Phone size={12} /> {PRIMARY_PHONE.display}</span>
                  <span className="flex items-center gap-1"><Mail size={12} /> {EMAIL}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


