import { Link } from 'react-router-dom';
import { ShoppingCart, FileText, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const hasDiscount = !product.priceOnRequest && product.salePrice && product.price && product.salePrice < product.price;
  const discountPercent = hasDiscount ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.priceOnRequest) return;
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image">
        <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} loading="lazy" />
        <div className="product-card-overlay">
          <Eye size={20} /> Quick View
        </div>
        <div className="product-card-badges">
          {!product.inStock && <span className="badge badge-red">Out of Stock</span>}
          {product.featured && <span className="badge badge-yellow">Featured</span>}
          {product.isNew && <span className="badge badge-dark">New</span>}
          {product.bestSeller && <span className="badge badge-green">Best Seller</span>}
          {hasDiscount && <span className="badge badge-red">-{discountPercent}%</span>}
        </div>
      </Link>

      <div className="product-card-body">
        <div className="product-card-category">{product.category}</div>
        <Link to={`/products/${product.id}`}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        <p className="product-card-desc">{product.shortDescription}</p>
        {product.brand && <div className="product-card-brand">Brand: <strong>{product.brand}</strong></div>}

        <div className="product-card-footer">
          <div className="product-card-price">
            {product.priceOnRequest
              ? <span className="price-on-request">Price on Request</span>
              : hasDiscount
                ? (
                  <span className="price-amount">
                    KES {product.salePrice?.toLocaleString()} <small style={{ textDecoration: 'line-through', color: 'var(--grey)', marginLeft: 6 }}>KES {product.price?.toLocaleString()}</small>
                  </span>
                )
                : <span className="price-amount">KES {product.price?.toLocaleString()}</span>
            }
          </div>
          <div className="product-card-actions">
            {product.priceOnRequest ? (
              <Link to={`/quote?product=${product.id}&name=${encodeURIComponent(product.name)}`} className="btn btn-primary btn-sm">
                <FileText size={14} /> Quote
              </Link>
            ) : (
              <button onClick={handleAddToCart} className="btn btn-dark btn-sm" disabled={!product.inStock}>
                <ShoppingCart size={14} /> {product.inStock ? 'Add to Cart' : 'Unavailable'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
