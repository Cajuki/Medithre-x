import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, FileText, ArrowLeft, CheckCircle, Package, Phone, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const { addItem } = useCart();
  const hasDiscount = !product?.priceOnRequest && product?.salePrice && product?.price && product.salePrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}><div className="spinner" /></div>;
  if (!product) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}><h2>Product not found</h2><Link to="/products" className="btn btn-dark" style={{ marginTop: '20px' }}>Back to Products</Link></div>;

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container breadcrumb">
          <Link to="/products">Products</Link>
          <ChevronRight size={14} />
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          <ChevronRight size={14} />
          <span>{product.name}</span>
        </div>
      </div>

      <div className="container product-detail-grid">
        {/* Images */}
        <div className="product-images">
          <div className="product-main-img">
            <img src={product.images?.[imgIdx] || '/placeholder.jpg'} alt={product.name} />
            {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
          </div>
          {product.images?.length > 1 && (
            <div className="product-thumbs">
              {product.images.map((img, i) => (
                <button key={i} className={`thumb${imgIdx === i ? ' active' : ''}`} onClick={() => setImgIdx(i)}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          <div className="product-info-top">
            <div className="product-info-badges">
              <span className="badge badge-yellow">{product.category}</span>
              {product.inStock ? <span className="badge badge-green">In Stock</span> : <span className="badge badge-red">Out of Stock</span>}
              {product.featured && <span className="badge badge-dark">Featured</span>}
              {product.isNew && <span className="badge badge-dark">New</span>}
              {product.bestSeller && <span className="badge badge-yellow">Best Seller</span>}
            </div>
            <h1 className="product-info-name">{product.name}</h1>
          </div>

          <div className="product-info-price">
            {product.priceOnRequest
              ? <><span className="por-label">Price on Request</span><p className="por-hint">Contact us for competitive pricing and bulk discounts.</p></>
              : (
                <>
                  <span className="price-big">KES {(hasDiscount ? product.salePrice : product.price)?.toLocaleString()}</span>
                  {hasDiscount && (
                    <p className="por-hint">
                      Was KES {product.price?.toLocaleString()} . You save {discountPercent}% on this item.
                    </p>
                  )}
                  {!hasDiscount && <p className="por-hint">Ex. VAT. Delivery extra. Bulk discounts available.</p>}
                </>
              )
            }
          </div>

          <p className="product-info-desc">{product.description}</p>

          {/* Meta */}
          <div className="product-meta">
            {product.brand && <div className="meta-row"><span>Brand</span><strong>{product.brand}</strong></div>}
            {product.origin && <div className="meta-row"><span>Origin</span><strong>{product.origin}</strong></div>}
          </div>

          {/* Actions */}
          <div className="product-actions">
            {!product.priceOnRequest && product.inStock && (
              <div className="qty-selector">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
            )}

            {product.priceOnRequest ? (
              <Link
                to={`/quote?product=${product.id}&name=${encodeURIComponent(product.name)}`}
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
              >
                <FileText size={18} /> Request a Quote
              </Link>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
              >
                <ShoppingCart size={18} /> {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            )}

            <Link to="/quote" className="btn btn-dark btn-lg">
              <FileText size={18} />
            </Link>
          </div>

          {/* Trust */}
          <div className="product-trust">
            <div className="trust-item"><CheckCircle size={16} /> Genuine Certified Product</div>
            <div className="trust-item"><Package size={16} /> Warranty Included</div>
            <div className="trust-item"><Phone size={16} /> <a href="tel:0790080903">0790 080 903</a></div>
          </div>
        </div>
      </div>

      {/* Specs */}
      {product.specifications?.length > 0 && (
        <div className="container specs-section">
          <h2 className="specs-title">Technical Specifications</h2>
          <div className="specs-table">
            {product.specifications.map((s, i) => (
              <div key={i} className="spec-row">
                <span className="spec-key">{s.key}</span>
                <span className="spec-val">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back */}
      <div className="container" style={{ paddingBottom: '60px' }}>
        <Link to="/products" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>
    </div>
  );
}
