import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import {
  ChevronRight, Phone, Mail, MapPin, Clock, Send, Loader2,
  MessageSquare, Headphones, FileText, ArrowRight, CheckCircle
} from 'lucide-react';
import { PRIMARY_PHONE, SECONDARY_PHONE, EMAIL, ADDRESS } from '../config/contact.js';
import axios from 'axios';
import toast from 'react-hot-toast';

const departments = [
  { name: 'Sales', phone: PRIMARY_PHONE.display, email: EMAIL, icon: <FileText size={20} /> },
  { name: 'Technical Support', phone: SECONDARY_PHONE.display, email: EMAIL, icon: <Headphones size={20} /> },
  { name: 'Customer Service', phone: PRIMARY_PHONE.display, email: EMAIL, icon: <MessageSquare size={20} /> },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in required fields');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/contact', form);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent-light flex items-center justify-center">
            <CheckCircle size={40} className="text-accent-dark" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-3">Message Sent Successfully!</h2>
          <p className="text-sm text-charcoal-400 mb-6">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Seo title="Contact Medithrex | Medical Equipment Kenya" description="Get in touch with Medithrex for medical equipment inquiries, quotes, and support." />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="page-hero pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="container-custom page-hero-content">
          <div className="page-hero-breadcrumb">
            <Link to="/">Home</Link> <ChevronRight size={10} /> <span>Contact</span>
          </div>
          <h1>Get in Touch</h1>
          <p>We're here to help with your medical equipment needs</p>
        </div>
      </section>

      {/* ── Contact Cards ───────────────────────────────────────────────── */}
      <section className="section -mt-12 relative z-10">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-5 mb-16">
            {[
              { icon: <Phone size={22} />, title: 'Call Us', value: PRIMARY_PHONE.display, href: PRIMARY_PHONE.href, sub: 'Mon–Sat: 8AM–6PM' },
              { icon: <Mail size={22} />, title: 'Email Us', value: EMAIL, href: `mailto:${EMAIL}`, sub: 'We respond within 24 hours' },
              { icon: <MapPin size={22} />, title: 'Visit Us', value: ADDRESS || 'Nairobi, Kenya', href: '#', sub: 'By appointment only' },
            ].map((item, i) => (
              <motion.a
                key={item.title}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-6 flex items-start gap-4 hover:border-primary-100"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-1">{item.title}</p>
                  <p className="text-sm font-bold text-charcoal">{item.value}</p>
                  <p className="text-xs text-charcoal-400 mt-1">{item.sub}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* ── Contact Form ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-eyebrow">Send a Message</span>
              <h2 className="section-title mb-2">Let's Discuss Your Needs</h2>
              <p className="text-sm text-charcoal-400 mb-8">
                Fill out the form and our team will get back to you within 24 hours
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input type="text" value={form.name} onChange={update('name')} className="form-input" placeholder="Your name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input type="email" value={form.email} onChange={update('email')} className="form-input" placeholder="you@example.com" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={update('phone')} className="form-input" placeholder="+254 7XX XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <select value={form.subject} onChange={update('subject')} className="form-select">
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="quote-request">Quote Request</option>
                      <option value="support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={update('message')}
                    className="form-textarea"
                    rows={5}
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            </motion.div>

            {/* ── Department Contacts ────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <span className="section-eyebrow">Department Contacts</span>
                <h2 className="section-title mb-2">Reach Us Directly</h2>
                <p className="text-sm text-charcoal-400 mb-8">Contact the right department for faster assistance</p>
              </div>

              <div className="space-y-4">
                {departments.map((dept, i) => (
                  <motion.div
                    key={dept.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="premium-card p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary shrink-0">
                        {dept.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-charcoal">{dept.name}</p>
                        <p className="text-xs text-charcoal-400 mt-1">{dept.phone}</p>
                        <p className="text-xs text-charcoal-400">{dept.email}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <div className="premium-card p-6 bg-gradient-to-br from-secondary-50 to-white border-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-white">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-charcoal">Quick Response on WhatsApp</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">Get instant support via WhatsApp</p>
                  </div>
                  <a
                    href={`https://wa.me/${PRIMARY_PHONE.display.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto btn btn-sm bg-secondary text-white hover:bg-secondary-600"
                  >
                    Chat Now
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <section className="section-muted py-12">
        <div className="container-custom">
          <div className="rounded-lg overflow-hidden border border-border h-[300px] bg-section flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="mx-auto text-charcoal-400 mb-3" />
              <p className="text-sm text-charcoal-400">{ADDRESS || 'Nairobi, Kenya'}</p>
              <p className="text-xs text-charcoal-200 mt-1">Interactive map coming soon</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}