import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useViewportScroll } from 'framer-motion';
import {
  ShoppingCart, Heart, Eye, Star, ChevronLeft, ChevronRight,
  Scale, FileText, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { resolveAssetUrl } from '../utils/assets.js';
import toast from 'react-hot-toast';

export default function ProductCard({ product, featured = false }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { itemIds, addToWishlist } = useWishlist();
  const isInWishlist = itemIds.includes(product.id);

  const imageUrl = product.image_url
    ? resolveAssetUrl(product.image_url)
    : null;

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  // Use inStock from admin (in_stock field) - coordinates with admin side
  const inStock = product.inStock === true || product.inStock === undefined;
  const lowStock = false; // low stock indicator removed - stock count is admin-managed

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      toast.error('This product is currently unavailable');
      return;
    }
    addToCart(product, 1);
    toast.success('Added to cart');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product.id);
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white rounded-lg border border-border overflow-hidden transition-all duration-300.3s hover:-translate-y-1"
      style={{
        boxShadow: isHovered
          ? '0 8px 32px rgba(11,92,173,0.10), 0 2px 8px rgba(11,92,173,0.06)'
          : '0 1px 3px rgba(11,92,173,0.04), 0 1px 2px rgba(11,92,173,0.02)',
      }}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* ── Image Container ──────────────────────────────────────────── */}
        <div className="relative aspect-square bg-section overflow-hidden">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 skeleton" />
          )}
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover transition-all duration-500 ${
                imgLoaded ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-section">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-border flex items-center justify-center mb-2">
                  <Eye size={20} className="text-charcoal-400" />
                </div>
                <p className="text-xs text-charcoal-400">No image</p>
              </div>
            </div>
          )}

          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-primary-dark/60 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Quick Actions */}
          <div className={`absolute top-3 right-3 flex flex-col gap-1.5 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            <button
              onClick={handleToggleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isInWishlist
                  ? 'bg-danger text-white'
                  : 'bg-white/90 text-charcoal-600 hover:bg-white hover:text-danger shadow-sm'
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart size={14} className={isInWishlist ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full bg-white/90 text-charcoal-600 hover:bg-primary hover:text-white shadow-sm flex items-center justify-center transition-all"
              aria-label="Add to cart"
            >
              <ShoppingCart size={14} />
            </button>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge-danger text-[9px] px-2 py-0.5">-{discount}%</span>
            )}
            {featured && (
              <span className="badge-primary text-[9px] px-2 py-0.5">Featured</span>
            )}
          </div>

          {/* Stock indicator - based on admin in_stock field */}
          {inStock && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-accent-light text-accent-dark">
                <CheckCircle size={10} />
                In Stock
              </span>
            </div>
          )}
        </div>

        {/* ── Product Info ─────────────────────────────────────────────── */}
        <div className="p-4">
          {/* Manufacturer */}
          {product.manufacturer && (
            <p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-1">
              {product.manufacturer}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-semibold text-charcoal leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* SKU */}
          {product.sku && (
            <p className="text-[10px] text-charcoal-200 font-mono mb-2">SKU: {product.sku}</p>
          )}

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={i < (product.rating || 4) ? 'text-warning fill-warning' : 'text-border'}
                />
              ))}
            </div>
            <span className="text-[10px] text-charcoal-400">({product.review_count || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">
              KSh {Number(product.price).toLocaleString()}
            </span>
            {product.compare_price > 0 && (
              <span className="text-xs text-charcoal-400 line-through">
                KSh {Number(product.compare_price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Add to cart"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart size={15} />
            </button>
            <Link
              to={`/products/${product.id}`}
              className="px-3 py-2 border border-border text-charcoal-600 text-xs font-semibold rounded-md hover:bg-section hover:border-primary hover:text-primary transition-all"
            >
              <Eye size={13} />
            </Link>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}



