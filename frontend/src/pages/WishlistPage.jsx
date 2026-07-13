import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ArrowRight, Trash2, Loader2, ShoppingCart, CheckCircle, Eye, Star, X } from 'lucide-react';
import axios from 'axios';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { resolveAssetUrl } from '../utils/assets.js';
import toast from 'react-hot-toast';
import './WishlistPage.css';

export default function WishlistPage() {
  const { itemIds, removeFromWishlist, clearWishlist, count } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingAll, setAddingAll] = useState(false);

  // Fetch product details when itemIds change
  useEffect(() => {
    if (itemIds.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    const idsParam = itemIds.join(',');
    axios.get(`/api/products/batch?ids=${idsParam}`)
      .then(r => setProducts(r.data.products || []))
      .catch(() => toast.error('Failed to load wishlist products'))
      .finally(() => setLoading(false));
  }, [itemIds]);

  // ── Not logged in ──
  if (user == null) {
    return (
      <div className="wishlist-empty-page">
        <div className="wishlist-empty-content">
          <div className="wishlist-empty-icon">
            <Heart size={64} strokeWidth={1} />
          </div>
          <h2>Your Wishlist is Empty</h2>
          <p>Sign in to save products to your wishlist and access them from any device.</p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Sign In <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty wishlist ──
  if (itemIds.length === 0) {
    return (
      <div className="wishlist-empty-page">
        <div className="wishlist-empty-content">
          <div className="wishlist-empty-icon">
            <Heart size={64} strokeWidth={1} />
          </div>
          <h2>Your Wishlist is Empty</h2>
          <p>Browse our catalogue and save products you're interested in. They'll appear here ready to add to cart.</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Browse Products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    if (!product.inStock) {
      toast.error(`${product.name} is currently unavailable`);
      return;
    }
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleAddAllToCart = () => {
    const available = products.filter(p => p.inStock);
    if (available.length === 0) {
      toast.error('No products in your wishlist are currently available');
      return;
    }
    setAddingAll(true);
    available.forEach(p => addItem(p, 1));
    toast.success(`${available.length} item${available.length !== 1 ? 's' : ''} added to cart`);
    setAddingAll(false);
  };

  const handleRemove = (id, name) => {
    removeFromWishlist(id);
    toast.success(`Removed "${name}" from wishlist`);
  };

  const handleViewProduct = (id) => {
    navigate(`/products/${id}`);
  };

  const availableCount = products.filter(p => p.inStock).length;

  return (
    <div className="wishlist-page">
      {/* ── Hero ── */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">Your Saved Items</p>
          <h1>Wishlist</h1>
          <p>
            {products.length} item{products.length !== 1 ? 's' : ''} saved
            {availableCount > 0 && ` · ${availableCount} available`}
          </p>
        </div>
      </section>

      {/* ── Action Bar ── */}
      <div className="wishlist-action-bar">
        <div className="container wishlist-action-bar-inner">
          <div className="wishlist-action-left">
            <span className="wishlist-count-badge">{products.length}</span>
            <span className="wishlist-count-text">items in wishlist</span>
          </div>
          <div className="wishlist-action-right">
            <button
              onClick={handleAddAllToCart}
              disabled={addingAll || availableCount === 0}
              className="btn btn-primary btn-sm"
            >
              {addingAll ? (
                <><Loader2 size={14} className="spin" /> Adding All…</>
              ) : (
                <><ShoppingBag size={14} /> Add All to Cart ({availableCount})</>
              )}
            </button>
            {availableCount > 0 && (
              <Link to="/checkout" className="btn btn-accent btn-sm">
                Proceed to Checkout <ArrowRight size={14} />
              </Link>
            )}
            <button
              onClick={() => { clearWishlist(); toast.success('Wishlist cleared'); }}
              className="btn btn-ghost btn-sm text-danger"
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <section className="wishlist-section">
        <div className="container">
          {loading ? (
            <div className="wishlist-loading">
              <Loader2 size={32} className="spin text-primary" />
              <p>Loading your wishlist…</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="wishlist-grid"
            >
              <AnimatePresence>
                {products.map((product, index) => {
                  const imageUrl = product.images?.[0]
                    ? resolveAssetUrl(product.images[0])
                    : null;

                  return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="wishlist-card"
                    >
                      {/* Image */}
                      <div
                        className="wishlist-card-image"
                        onClick={() => handleViewProduct(product.id)}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('no-img'); }}
                          />
                        ) : (
                          <div className="wishlist-card-no-img">
                            <Eye size={24} />
                          </div>
                        )}

                        {/* Availability badge */}
                        <div className="wishlist-card-badge">
                          {product.inStock ? (
                            <span className="badge badge-green">
                              <CheckCircle size={10} /> In Stock
                            </span>
                          ) : (
                            <span className="badge badge-gray">
                              Unavailable
                            </span>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          className="wishlist-card-remove"
                          onClick={() => handleRemove(product.id, product.name)}
                          title="Remove from wishlist"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="wishlist-card-info">
                        {product.brand && (
                          <p className="wishlist-card-brand">{product.brand}</p>
                        )}
                        <h3
                          className="wishlist-card-name"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          {product.name}
                        </h3>
                        {product.sku && (
                          <p className="wishlist-card-sku">SKU: {product.sku}</p>
                        )}

                        {/* Rating placeholder */}
                        <div className="wishlist-card-rating">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < 4 ? 'star-filled' : 'star-empty'}
                            />
                          ))}
                        </div>

                        {/* Price */}
                        <div className="wishlist-card-price">
                          {product.priceOnRequest ? (
                            <span className="price-on-request">Price on Request</span>
                          ) : (
                            <span className="price-current">
                              KSh {Number(product.price).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="wishlist-card-actions">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.inStock}
                            className="btn btn-primary btn-sm wishlist-add-btn"
                          >
                            <ShoppingCart size={14} />
                            {product.inStock ? 'Add to Cart' : 'Unavailable'}
                          </button>
                          <button
                            onClick={() => handleViewProduct(product.id)}
                            className="btn btn-outline btn-sm wishlist-view-btn"
                          >
                            <Eye size={14} /> View
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Bottom navigation ── */}
          <div className="wishlist-bottom-nav">
            <Link to="/products" className="btn btn-outline">
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Continue Shopping
            </Link>
            {availableCount > 0 && (
              <Link to="/checkout" className="btn btn-primary btn-lg">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
