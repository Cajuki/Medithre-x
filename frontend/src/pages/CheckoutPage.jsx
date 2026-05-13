import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CheckCircle } from 'lucide-react';
import { PRIMARY_PHONE, SECONDARY_PHONE } from '../config/contact.js';
import { resolveAssetUrl } from '../utils/assets.js';
import './CheckoutPage.css';

const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Nyeri','Meru','Kakamega','Garissa','Machakos','Kisii','Kitale','Malindi','Lamu','Mandera','Wajir','Marsabit','Isiolo','Embu','Nanyuki','Kericho','Bomet','Nandi','Trans Nzoia','Bungoma','Busia','Siaya','Homa Bay','Migori','Nyamira','Vihiga','Butali','Kwale','Kilifi','Tana River','Taita Taveta','Kajiado','Makueni','Kitui','Tharaka Nithi','Kirinyaga','Murang\'a','Kiambu','Nyandarua','Laikipia','Samburu','West Pokot','Turkana','Baringo'];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [form, setForm] = useState({
    street: '', city: '', county: '', country: 'Kenya',
    paymentMethod: 'Invoice', notes: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const effectivePrice = (item) => item.salePrice || item.price || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/orders', {
        items: items.map(i => ({ product: i.id, name: i.name, quantity: i.quantity, price: effectivePrice(i) })),
        shippingAddress: { street: form.street, city: form.city, county: form.county, country: form.country },
        paymentMethod: form.paymentMethod,
        notes: form.notes
      });
      setOrderNumber(res.data.orderNumber);
      clearCart();
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) return (
    <div className="checkout-success">
      <div className="success-card">
        <div className="success-icon"><CheckCircle size={56} /></div>
        <h2>Order Placed Successfully!</h2>
        <p className="order-num">Order #{orderNumber}</p>
        <p>Thank you, {user?.name?.split(' ')[0]}. Our team will contact you within 24 hours to confirm and process your order.</p>
        <p className="success-contact">For urgent inquiries: <a href={PRIMARY_PHONE.href}>{PRIMARY_PHONE.display}</a> or <a href={SECONDARY_PHONE.href}>{SECONDARY_PHONE.display}</a></p>
        <div className="success-actions">
          <button className="btn btn-primary" onClick={() => navigate('/account/orders')}>View My Orders</button>
          <button className="btn btn-outline" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">Complete Your Order</p>
          <h1>Checkout</h1>
        </div>
      </div>

      <div className="container checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-steps">
            <div className={`checkout-step${step >= 1 ? ' active' : ''}`}><span>1</span> Delivery</div>
            <div className="step-line" />
            <div className={`checkout-step${step >= 2 ? ' active' : ''}`}><span>2</span> Payment</div>
          </div>

          {step === 1 && (
            <div className="form-section">
              <h3>Delivery Address</h3>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Street Address</label>
                  <input className="form-input" value={form.street} onChange={e => set('street', e.target.value)} placeholder="e.g. Kenyatta Avenue, 3rd Floor" required />
                </div>
                <div className="form-group">
                  <label className="form-label">City / Town</label>
                  <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Nairobi" required />
                </div>
                <div className="form-group">
                  <label className="form-label">County</label>
                  <select className="form-select" value={form.county} onChange={e => set('county', e.target.value)} required>
                    <option value="">Select County</option>
                    {COUNTIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Special delivery instructions, installation requirements..." style={{ minHeight: '80px' }} />
                </div>
              </div>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => { if (!form.street || !form.city || !form.county) { toast.error('Please fill all address fields'); return; } setStep(2); }}>
                Continue to Payment →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                {[
                  { val: 'Invoice', label: 'LPO / Invoice', desc: 'Institutional invoice (NET 30 days)' },
                  { val: 'M-Pesa', label: 'M-Pesa', desc: 'Lipa na M-Pesa, Paybill or Till' },
                  { val: 'Bank Transfer', label: 'Bank Transfer', desc: 'KCB, Equity, Co-op Bank' },
                  { val: 'Credit Card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard accepted' },
                ].map(opt => (
                  <label key={opt.val} className={`payment-option${form.paymentMethod === opt.val ? ' selected' : ''}`}>
                    <input type="radio" name="payment" value={opt.val} checked={form.paymentMethod === opt.val} onChange={() => set('paymentMethod', opt.val)} />
                    <div>
                      <strong>{opt.label}</strong>
                      <span>{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="checkout-nav">
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Summary */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="checkout-items">
            {items.map(i => (
              <div key={i.id} className="checkout-item">
                <img src={resolveAssetUrl(i.images?.[0])} alt={i.name} />
                <div>
                  <p>{i.name}</p>
                  <span>Qty: {i.quantity}</span>
                </div>
                <strong>{i.priceOnRequest ? '—' : `KES ${(effectivePrice(i) * i.quantity).toLocaleString()}`}</strong>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <span>KES {total.toLocaleString()}</span>
          </div>
          <div className="checkout-trust">
            <p>✓ Order confirmation via SMS & Email</p>
            <p>✓ Dedicated account manager assigned</p>
            <p>✓ Equipment warranty included</p>
          </div>
        </div>
      </div>
    </div>
  );
}
