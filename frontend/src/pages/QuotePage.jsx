import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, Plus, Trash2, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { isValidEmail, isValidKenyanPhone, normalizeKenyanPhone, KENYAN_PHONE_HINT } from '../utils/validation.js';
import Seo from '../components/Seo.jsx';
import { BUSINESS_EMAIL, PRIMARY_PHONE, SECONDARY_PHONE } from '../config/contact.js';
import './QuotePage.css';

const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Nyeri','Meru','Kakamega','Garissa','Machakos','Kisii','Kitale','Other'];

export default function QuotePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initProduct = searchParams.get('name')
    ? [{ productId: searchParams.get('product') || null, productName: searchParams.get('name'), quantity: 1, notes: '' }]
    : [{ productId: null, productName: '', quantity: 1, notes: '' }];

  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', county: '', message: '' });
  const [items, setItems] = useState(initProduct);
  const [submitted, setSubmitted] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      company: user.company || '',
      county: user.county || '',
    }));
  }, [user]);

  if (!user) {
    return (
      <div>
        <Seo
          title="Request a Quote"
          description="Sign in to request a quote for medical or laboratory equipment with Medithrex. Secure competitive pricing and delivery across Kenya."
          url={window.location.href}
          noindex={true}
        />
        <div className="page-hero">
          <div className="container page-hero-content">
            <p className="section-label">Access Required</p>
            <h1>Please Sign In</h1>
            <p>You need to be signed in to request a quote. Please log in or create an account.</p>
            <div className="quote-auth-actions">
              <Link to="/login" className="btn btn-primary">Sign In</Link>
              <Link to="/register" className="btn btn-outline">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const addItem = () => setItems(prev => [...prev, { productName: '', quantity: 1, notes: '' }]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return toast.error('Please fill in all required fields');
    if (!isValidEmail(form.email)) return toast.error('Enter a valid email address');
    if (!isValidKenyanPhone(form.phone)) return toast.error(KENYAN_PHONE_HINT);
    if (!items.length || items.some(item => !item.productName)) return toast.error('Add at least one item');
    setLoading(true);
    try {
      const res = await axios.post('/api/quotes', {
        ...form,
        email: form.email.trim().toLowerCase(),
        phone: normalizeKenyanPhone(form.phone),
        items,
      });
      setQuoteNumber(res.data.quoteNumber);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="quote-success">
      <div className="success-card">
        <div className="success-icon"><CheckCircle size={56} /></div>
        <h2>Quote Request Submitted!</h2>
        <p className="order-num">{quoteNumber}</p>
        <p>Thank you, {form.name.split(' ')[0]}. Our sales team will review your request and get back to you within <strong>24 hours</strong> with a detailed quotation.</p>
        <div className="quote-success-contact">
          <a href={PRIMARY_PHONE.href}><Phone size={16} /> {PRIMARY_PHONE.display}</a>
          <a href={SECONDARY_PHONE.href}><Phone size={16} /> {SECONDARY_PHONE.display}</a>
          <a href={`mailto:${BUSINESS_EMAIL}`}><Mail size={16} /> {BUSINESS_EMAIL}</a>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Seo
        title="Request a Quote"
        description="Submit a quote request for medical and laboratory equipment from Medithrex and receive a tailored offer within 24 hours."
        url={window.location.href}
      />
      <div className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">Get Competitive Pricing</p>
          <h1>Request a Quote</h1>
          <p>Fill in your requirements and our sales team will respond with a tailored quotation within 24 hours.</p>
        </div>
      </div>

      <div className="container quote-layout">
        <div className="quote-form-wrap">
          <form onSubmit={handleSubmit} className="quote-form">
            {/* Contact info */}
            <div className="form-section-card">
              <h3>Your Contact Information</h3>
              {user && (
                <p style={{ marginTop: '-4px', marginBottom: '16px', color: 'var(--grey)', fontSize: '0.9rem' }}>
                  Your account details have been filled in automatically.
                </p>
              )}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Dr. Jane Wanjiru" required disabled={!!user} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="jane@hospital.co.ke" required disabled={!!user} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone / WhatsApp *</label>
                  <input className="form-input" inputMode="tel" value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="0790 080 903" required disabled={!!user} />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution / Company</label>
                  <input className="form-input" value={form.company} onChange={e => setF('company', e.target.value)} placeholder="Kenyatta National Hospital" disabled={!!user} />
                </div>
                <div className="form-group">
                  <label className="form-label">County</label>
                  <select className="form-select" value={form.county} onChange={e => setF('county', e.target.value)} disabled={!!user}>
                    <option value="">Select County</option>
                    {COUNTIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Equipment list */}
            <div className="form-section-card">
              <h3>Equipment Required</h3>
              <div className="quote-items">
                {items.map((item, i) => (
                  <div key={i} className="quote-item">
                    <div className="quote-item-num">{i + 1}</div>
                    <div className="quote-item-fields">
                      <input
                        className="form-input"
                        value={item.productName}
                        onChange={e => setItem(i, 'productName', e.target.value)}
                        placeholder="Equipment name (e.g. Hematology Analyzer)"
                        required
                      />
                      <div className="quote-item-row2">
                        <div>
                          <label className="form-label">Quantity</label>
                          <input type="number" min="1" className="form-input" value={item.quantity} onChange={e => setItem(i, 'quantity', e.target.value)} style={{ width: '100px' }} />
                        </div>
                        <div className="quote-item-notes">
                          <label className="form-label">Specifications / Notes</label>
                          <input className="form-input" value={item.notes} onChange={e => setItem(i, 'notes', e.target.value)} placeholder="Model preference, features needed..." />
                        </div>
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button type="button" className="remove-item-btn" onClick={() => removeItem(i)}><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
                  <Plus size={15} /> Add Another Item
                </button>
              </div>
            </div>

            {/* Message */}
            <div className="form-section-card">
              <h3>Additional Information</h3>
              <div className="form-group">
                <label className="form-label">Message / Requirements</label>
                <textarea className="form-textarea" value={form.message} onChange={e => setF('message', e.target.value)} placeholder="Budget range, delivery timeline, installation requirements, after-sales support needed..." />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Submitting...' : 'Submit Quote Request'}
            </button>
          </form>
        </div>

        {/* Side info */}
        <div className="quote-side">
          <div className="quote-side-card">
            <h4>Why Request a Quote?</h4>
            <ul>
              <li>✓ Competitive, transparent pricing</li>
              <li>✓ Bulk order discounts available</li>
              <li>✓ Flexible payment — LPO, M-Pesa, Invoice</li>
              <li>✓ Installation & training included</li>
              <li>✓ Delivery across all 47 counties</li>
              <li>✓ 12–24 month warranty on most items</li>
            </ul>
          </div>
          <div className="quote-side-card quote-contact-card">
            <h4>Prefer to Call?</h4>
            <p>Our sales team is available Monday–Friday, 8AM–6PM EAT.</p>
            <a href={PRIMARY_PHONE.href} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Phone size={16} /> {PRIMARY_PHONE.display}
            </a>
            <a href={SECONDARY_PHONE.href} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
              <Phone size={16} /> {SECONDARY_PHONE.display}
            </a>
            <a href={`mailto:${BUSINESS_EMAIL}`} className="btn btn-dark" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
              <Mail size={16} /> {BUSINESS_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
