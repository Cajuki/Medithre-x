import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './CartPage.css';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();
  const effectivePrice = (item) => item.salePrice || item.price || 0;

  if (items.length === 0) return (
    <div className="empty-cart-page">
      <div className="empty-cart-content">
        <ShoppingBag size={64} strokeWidth={1} />
        <h2>Your Cart is Empty</h2>
        <p>Browse our catalogue and add medical equipment to your cart.</p>
        <Link to="/products" className="btn btn-primary btn-lg">Browse Products <ArrowRight size={18} /></Link>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">Your Selection</p>
          <h1>Shopping Cart</h1>
          <p>{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="container cart-layout">
        {/* Items */}
        <div className="cart-items">
          <div className="cart-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>
          {items.map(item => (
            <div key={item.id} className="cart-row">
              <div className="cart-product">
                <img src={item.images?.[0]} alt={item.name} />
                <div>
                  <Link to={`/products/${item.id}`}><h4>{item.name}</h4></Link>
                  <p>{item.category}</p>
                  {item.brand && <span>Brand: {item.brand}</span>}
                </div>
              </div>
              <div className="cart-price">
                {item.priceOnRequest ? 'On Request' : `KES ${effectivePrice(item).toLocaleString()}`}
              </div>
              <div className="cart-qty">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
              </div>
              <div className="cart-subtotal">
                {item.priceOnRequest ? '—' : `KES ${(effectivePrice(item) * item.quantity).toLocaleString()}`}
              </div>
              <button className="cart-remove" onClick={() => removeItem(item.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div className="cart-footer-bar">
            <button onClick={clearCart} className="btn btn-outline btn-sm">
              <Trash2 size={14} /> Clear Cart
            </button>
            <Link to="/products" className="btn btn-outline btn-sm">Continue Shopping</Link>
          </div>
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-rows">
            {items.map(i => (
              <div key={i.id} className="summary-row">
                <span>{i.name} × {i.quantity}</span>
                <span>{i.priceOnRequest ? 'On Request' : `KES ${(effectivePrice(i) * i.quantity).toLocaleString()}`}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Estimated Total</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
          {items.some(i => i.priceOnRequest) && (
            <p className="summary-note">* Some items are priced on request. Final total will be confirmed after quoting.</p>
          )}
          {user ? (
            <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Proceed to Checkout <ArrowRight size={18} />
            </Link>
          ) : (
            <Link to="/login?next=/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Sign In to Checkout <ArrowRight size={18} />
            </Link>
          )}
          <Link to="/quote" className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
            Request Quote Instead
          </Link>
          <div className="summary-trust">
            <span>✓ Secure Checkout</span>
            <span>✓ M-Pesa Accepted</span>
            <span>✓ Invoice Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
