import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { isValidEmail, isValidKenyanPhone, normalizeKenyanPhone, KENYAN_PHONE_HINT } from '../utils/validation.js';
import Seo from '../components/Seo.jsx';
import { BUSINESS_EMAIL, BUSINESS_LOCATION, PRIMARY_PHONE, SECONDARY_PHONE } from '../config/contact.js';
import './ContactPage.css';

export default function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) return toast.error('Enter a valid email address');
    if (form.phone && !isValidKenyanPhone(form.phone)) return toast.error(KENYAN_PHONE_HINT);
    setLoading(true);
    try {
      await axios.post('/api/contact', {
        ...form,
        email: form.email.trim().toLowerCase(),
        phone: form.phone ? normalizeKenyanPhone(form.phone) : '',
      });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Seo
        title="Contact Us"
        description="Contact Medithrex for product enquiries, quotes, or technical support for medical and laboratory equipment in Kenya."
        url={window.location.href}
      />
      <div className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">Get In Touch</p>
          <h1>Contact Us</h1>
          <p>Our team is ready to assist with product enquiries, quotes, and technical support.</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Info cards */}
        <div className="contact-info">
          <div className="contact-info-card">
            <div className="ci-icon"><Phone size={22} /></div>
            <div>
              <h4>Phone & WhatsApp</h4>
              <a href={PRIMARY_PHONE.href}>{PRIMARY_PHONE.display}</a>
              <a href={SECONDARY_PHONE.href}>{SECONDARY_PHONE.display}</a>
              <p>Call or WhatsApp anytime</p>
            </div>
          </div>

             <div className="contact-info-card">
               <div className="ci-icon"><Mail size={22} /></div>
               <div>
                 <h4>Email</h4>
                 <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>
                 <p>We reply within 24 hours</p>
               </div>
             </div>

          <div className="contact-info-card">
            <div className="ci-icon"><MapPin size={22} /></div>
            <div>
              <h4>Our Location</h4>
              <p style={{ fontWeight: 600, color: 'var(--black)' }}>{BUSINESS_LOCATION}</p>
              <p>Nairobi CBD, Nairobi, Kenya</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="ci-icon"><Clock size={22} /></div>
            <div>
              <h4>Working Hours</h4>
              <p>Monday – Friday: 8AM – 6PM</p>
              <p>Saturday: 9AM – 2PM EAT</p>
            </div>
          </div>

          {/* Embedded map */}
          <div className="contact-map">
            <iframe
              title="medithrex — Pramukh Plaza, Nairobi CBD"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8185987700456!2d36.8175!3d-1.2833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d22ef9aaab%3A0x9da5b6c6c0b9c4e0!2sNairobi+CBD!5e0!3m2!1sen!2ske!4v1"
              width="100%" height="200"
              style={{ border: 0, borderRadius: '8px', display: 'block' }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Form */}
        {submitted ? (
          <div className="contact-success">
            <CheckCircle size={48} />
            <h3>Message Received!</h3>
            <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
            <a href={PRIMARY_PHONE.href} className="btn btn-primary"><Phone size={16} /> {PRIMARY_PHONE.display}</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <h3>Send Us a Message</h3>
            {user && (
              <p style={{ marginTop: '-4px', marginBottom: '16px', color: 'var(--grey)', fontSize: '0.9rem' }}>
                Your account details have been filled in automatically.
              </p>
            )}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your name" disabled={!!user} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="your@email.com" disabled={!!user} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" inputMode="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0700 000 000" disabled={!!user} />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select className="form-select" value={form.subject} onChange={e => set('subject', e.target.value)}>
                  <option value="">Select Subject</option>
                  <option>Product Enquiry</option>
                  <option>Quote Request</option>
                  <option>Order Support</option>
                  <option>Technical Support</option>
                  <option>General Enquiry</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-textarea" value={form.message} onChange={e => set('message', e.target.value)} required placeholder="How can we help you?" style={{ minHeight: '140px' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
