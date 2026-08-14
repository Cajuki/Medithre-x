import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Seo from '../components/Seo.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { resolveAssetUrl } from '../utils/assets.js';
import {
  ShoppingCart, Heart, Eye, Star, ChevronLeft, ChevronRight,
  Scale, FileText, CheckCircle, XCircle, AlertCircle, Truck, Shield,
  Clock, Download, Share2, Minus, Plus, Loader2, Package, Phone,
  ChevronDown, Award, Headphones, MapPin, ArrowRight
} from 'lucide-react';
import { PRIMARY_PHONE } from '../config/contact.js';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart, count } = useCart();
  const { itemIds, addToWishlist } = useWishlist();
  const isInWishlist = itemIds.includes(id);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    axios.get(`/api/products/${id}`)
      .then(r => {
        setProduct(r.data.product || r.data);
        setRelatedProducts(r.data.related || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="container-custom py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square skeleton rounded-lg" />
            <div className="space-y-4">
              <div className="h-4 skeleton w-1/4" />
              <div className="h-8 skeleton w-3/4" />
              <div className="h-4 skeleton w-1/2" />
              <div className="h-6 skeleton w-1/3" />
              <div className="h-24 skeleton w-full" />
              <div className="h-12 skeleton w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="mx-auto text-charcoal-400 mb-4" />
          <h2 className="text-xl font-bold text-charcoal">Product not found</h2>
          <Link to="/products" className="btn btn-primary mt-4">Browse Products</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0
    ? product.images.map(i => resolveAssetUrl(i))
    : product.image_url ? [resolveAssetUrl(product.image_url)] : [];

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`Added ${quantity} item(s) to cart`);
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'shipping', label: 'Shipping & Returns' },
  ];

  return (
    <div className="min-h-screen pt-24">
      <Seo title={`${product.name} | Medithrex`} description={product.description?.substring(0, 160)} />

      {/* Breadcrumb */}
      <div className="bg-section border-b border-border">
        <div className="container-custom py-3">
          <div className="flex items-center gap-2 text-xs text-charcoal-400">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={10} />
            <Link to="/products" className="hover:text-primary">Products</Link>
            {product.category && (
              <>
                <ChevronRight size={10} />
                <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-primary">{product.category}</Link>
              </>
            )}
            <ChevronRight size={10} />
            <span className="text-charcoal-600 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Main */}
      <section className="py-8 lg:py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* ── Gallery ──────────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-square rounded-lg bg-section overflow-hidden border border-border mb-4">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Eye size={48} className="text-charcoal-400" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {discount > 0 && <span className="badge-danger">-{discount}%</span>}
                </div>

{/* Wishlist */}
                 <button
                   onClick={() => { addToWishlist(id); toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist'); }}
                   className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                     isInWishlist ? 'bg-danger text-white' : 'bg-white text-charcoal-600 hover:text-danger'
                   }`}
                 >
                   <Heart size={18} className={isInWishlist ? 'fill-current' : ''} />
                 </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                        i === selectedImage ? 'border-primary' : 'border-border hover:border-primary-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── Product Info ─────────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {/* Manufacturer & SKU */}
              <div className="flex items-center gap-3 mb-3">
                {product.manufacturer && (
                  <span className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">{product.manufacturer}</span>
                )}
                {product.sku && (
                  <span className="text-[10px] text-charcoal-200 font-mono">SKU: {product.sku}</span>
                )}
              </div>

              <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-charcoal leading-tight mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className={i < (product.rating || 4) ? 'fill-warning text-warning' : 'text-border'} />
                  ))}
                </div>
                <span className="text-sm text-charcoal-400">({product.review_count || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-end gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">KSh {Number(product.price).toLocaleString()}</span>
                {product.compare_price > 0 && (
                  <span className="text-lg text-charcoal-400 line-through">KSh {Number(product.compare_price).toLocaleString()}</span>
                )}
                {discount > 0 && <span className="badge-danger text-xs">Save {discount}%</span>}
              </div>

              {/* Stock Status */}
              {inStock && (
                <div className="flex items-center gap-2 mb-6">
                  <span className={`flex items-center gap-1.5 text-sm font-medium ${lowStock ? 'text-warning-dark' : 'text-accent-dark'}`}>
                    {lowStock ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    {lowStock ? `Only ${product.stock} left in stock` : 'In Stock'}
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-charcoal-600 leading-relaxed mb-6">{product.description}</p>

              {/* Quantity & Add to Cart */}
              {inStock && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-3 hover:bg-section transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-3 font-semibold text-sm min-w-[40px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="p-3 hover:bg-section transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button onClick={handleAddToCart} className="btn btn-primary btn-lg product-cart-button" title="Add to cart" aria-label={`Add ${product.name} to cart`}>
                    <ShoppingCart size={18} />
                  </button>
                  <Link to="/cart" className="btn btn-outline btn-lg product-view-cart" aria-label="View cart" title="View cart">
                    <ShoppingCart size={18} /><span className="product-cart-count">{count}</span>
                  </Link>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link to="/quote" className="btn btn-outline btn-md">
                  <FileText size={15} /> Request Quote
                </Link>
                <a href={PRIMARY_PHONE.href} className="btn btn-outline btn-md">
                  <Phone size={15} /> Call for Inquiry
                </a>
              </div>

              {/* Trust Features */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-section border border-border">
                {[
                  { icon: <Truck size={16} />, text: 'Nationwide Delivery' },
                  { icon: <Shield size={16} />, text: 'Warranty Included' },
                  { icon: <Clock size={16} />, text: 'Fast Shipping' },
                  { icon: <Award size={16} />, text: 'Genuine Products' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-charcoal-600">
                    <span className="text-secondary">{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <section className="section-muted py-12">
        <div className="container-custom">
          <div className="border-b border-border mb-8">
            <div className="flex gap-6 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-charcoal-400 border-transparent hover:text-charcoal'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            {activeTab === 'description' && (
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-charcoal-600 leading-relaxed">{product.description || 'No description available.'}</p>
                {product.features?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base font-bold text-charcoal mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-charcoal-600">
                          <CheckCircle size={14} className="text-secondary mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                {product.specifications?.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <tbody>
                        {product.specifications.map((spec, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-section'}>
                            <td className="px-4 py-3 font-semibold text-charcoal-600 w-1/3">{spec.name || spec.label}</td>
                            <td className="px-4 py-3 text-charcoal-400">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-400">No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <p className="text-sm text-charcoal-400">Reviews coming soon.</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 text-sm text-charcoal-600 leading-relaxed">
                <p>We offer nationwide delivery across all 47 counties in Kenya. Delivery times vary by location and product availability.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Standard Delivery', time: '3-5 business days', cost: 'KSh 500' },
                    { title: 'Express Delivery', time: '1-2 business days', cost: 'KSh 1,500' },
                    { title: 'Same Day (Nairobi)', time: 'Within 6 hours', cost: 'KSh 2,500' },
                    { title: 'Installation Service', time: 'Scheduled', cost: 'Included' },
                  ].map((s, i) => (
                    <div key={i} className="p-4 rounded-lg bg-white border border-border">
                      <p className="font-semibold text-charcoal mb-1">{s.title}</p>
                      <p className="text-xs text-charcoal-400">{s.time} • {s.cost}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Related Products ────────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <span className="section-eyebrow">You May Also Like</span>
                <h2 className="section-title">Related Products</h2>
              </div>
              <Link to="/products" className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700">
                View All <ArrowRight size={15} />
              </Link>
            </div>
            <div className="products-grid">
              {relatedProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
