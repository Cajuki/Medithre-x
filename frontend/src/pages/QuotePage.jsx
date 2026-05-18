import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, Plus, Trash2, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  isValidEmail,
  isValidKenyanPhone,
  normalizeKenyanPhone,
  KENYAN_PHONE_HINT
} from '../utils/validation.js';
import {
  BUSINESS_EMAIL,
  PRIMARY_PHONE,
  SECONDARY_PHONE
} from '../config/contact.js';
import './QuotePage.css';

const COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Nyeri',
  'Meru','Kakamega','Garissa','Machakos','Kisii','Kitale','Other'
];

export default function QuotePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const productId = searchParams.get('product');
  const productName = searchParams.get('name');

  const initProduct =
    productName
      ? [{
          productId: productId || null,
          productName: productName,
          quantity: 1,
          notes: ''
        }]
      : [{
          productId: null,
          productName: '',
          quantity: 1,
          notes: ''
        }];

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    county: '',
    message: ''
  });

  const [items, setItems] = useState(initProduct);
  const [submitted, setSubmitted] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      company: user.company || '',
      county: user.county || ''
    }));
  }, [user]);

  if (!user) {
    return (
      <div className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">Access Required</p>
          <h1>Please Sign In</h1>
          <p>You need to be signed in to request a quote.</p>

          <div style={{ marginTop: '2rem' }}>
            <Link to="/login" className="btn btn-primary">Sign In</Link>
            <Link to="/register" className="btn btn-outline" style={{ marginLeft: '1rem' }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const setF = (k, v) =>
    setForm(f => ({ ...f, [k]: v }));

  const setItem = (i, k, v) =>
    setItems(prev =>
      prev.map((it, idx) =>
        idx === i ? { ...it, [k]: v } : it
      )
    );

  const addItem = () =>
    setItems(prev => [
      ...prev,
      { productName: '', quantity: 1, notes: '' }
    ]);

  const removeItem = (i) =>
    setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validations
    if (!form.name || !form.email || !form.phone) {
      return toast.error('Please fill in all required fields');
    }

    if (!isValidEmail(form.email)) {
      return toast.error('Enter a valid email address');
    }

    if (!isValidKenyanPhone(form.phone)) {
      return toast.error(KENYAN_PHONE_HINT);
    }

    if (!items.length || items.some(i => !i.productName.trim())) {
      return toast.error('Add at least one item');
    }

    setLoading(true);

    try {
      // ✅ SAFE PAYLOAD (FIXED CRASHES)
      const payload = {
        ...form,
        email: form.email.trim().toLowerCase(),
        phone: normalizeKenyanPhone(form.phone),

        items: items.map(i => ({
          productId: i.productId || null,
          productName: i.productName.trim(),
          quantity:
            i.quantity === '' || i.quantity === null
              ? 1
              : Number(i.quantity),   // 🔥 FIX: number conversion
          notes: i.notes || ''
        }))
      };

      const res = await axios.post('/api/quotes', payload);

      setQuoteNumber(res.data.quoteNumber);
      setSubmitted(true);

    } catch (err) {
      console.error(err.response?.data || err.message);

      toast.error(
        err.response?.data?.message || 'Submission failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (submitted) {
    return (
      <div className="quote-success">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={56} />
          </div>

          <h2>Quote Request Submitted!</h2>

          <p className="order-num">{quoteNumber}</p>

          <p>
            Thank you, {form.name.split(' ')[0]}.
            We will respond within <strong>24 hours</strong>.
          </p>

          <div className="quote-success-contact">
            <a href={PRIMARY_PHONE.href}>
              <Phone size={16} /> {PRIMARY_PHONE.display}
            </a>

            <a href={SECONDARY_PHONE.href}>
              <Phone size={16} /> {SECONDARY_PHONE.display}
            </a>

            <a href={`mailto:${BUSINESS_EMAIL}`}>
              <Mail size={16} /> {BUSINESS_EMAIL}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* HERO */}
      <div className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">Get Competitive Pricing</p>
          <h1>Request a Quote</h1>
          <p>Fill in your requirements and we will respond within 24 hours.</p>
        </div>
      </div>

      {/* FORM */}
      <div className="container quote-layout">

        <div className="quote-form-wrap">
          <form onSubmit={handleSubmit} className="quote-form">

            {/* CONTACT */}
            <div className="form-section-card">
              <h3>Your Contact Information</h3>

              <div className="form-grid-2">

                <input
                  className="form-input"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={e => setF('name', e.target.value)}
                  required
                />

                <input
                  className="form-input"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setF('email', e.target.value)}
                  required
                />

                <input
                  className="form-input"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={e => setF('phone', e.target.value)}
                  required
                />

                <input
                  className="form-input"
                  placeholder="Company"
                  value={form.company}
                  onChange={e => setF('company', e.target.value)}
                />

                <select
                  className="form-select"
                  value={form.county}
                  onChange={e => setF('county', e.target.value)}
                >
                  <option value="">Select County</option>
                  {COUNTIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

              </div>
            </div>

            {/* ITEMS */}
            <div className="form-section-card">
              <h3>Equipment Required</h3>

              {items.map((item, i) => (
                <div key={i} className="quote-item">

                  <input
                    className="form-input"
                    value={item.productName}
                    onChange={e => setItem(i, 'productName', e.target.value)}
                    placeholder="Product name"
                    required
                  />

                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={item.quantity}
                    onChange={e => setItem(i, 'quantity', Number(e.target.value))}   // 🔥 FIX
                  />

                  <input
                    className="form-input"
                    value={item.notes}
                    onChange={e => setItem(i, 'notes', e.target.value)}
                    placeholder="Notes"
                  />

                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)}>
                      <Trash2 size={16} />
                    </button>
                  )}

                </div>
              ))}

              <button type="button" onClick={addItem} className="btn btn-outline">
                <Plus size={16} /> Add Item
              </button>
            </div>

            {/* MESSAGE */}
            <div className="form-section-card">
              <textarea
                className="form-textarea"
                value={form.message}
                onChange={e => setF('message', e.target.value)}
                placeholder="Additional requirements..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading ? 'Submitting...' : 'Submit Quote Request'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}