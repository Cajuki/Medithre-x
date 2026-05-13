import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowRight, CheckCircle, Phone, Star,
  Shield, Truck, Headphones, Award, ChevronRight, ImagePlus
} from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import photo1 from '../Assets/photo1.png';
import photo2 from '../Assets/photo2.png';
import photo3 from '../Assets/photo3.png';
import { PRIMARY_PHONE, SECONDARY_PHONE } from '../config/contact.js';
import { resolveAssetUrl } from '../utils/assets.js';
import './HomePage.css';

const HERO_SLIDES = [
  {
    title: 'Advanced Medical Equipment for Kenya',
    sub: 'Supplying hospitals, clinics, and labs across Kenya with world-class diagnostic, surgical, and laboratory equipment.',
    image: photo1,
    cta: 'Browse Products', ctaLink: '/products',
    cta2: 'Request a Quote', cta2Link: '/quote',
  },
  {
    title: 'Laboratory Solutions Built for Precision',
    sub: 'From hematology analyzers to PCR machines — equip your lab with certified, reliable instruments.',
    image: photo2,
    cta: 'View Lab Equipment', ctaLink: '/products?category=Laboratory+Equipment',
    cta2: 'Contact Us', cta2Link: '/contact',
  },
  {
    title: 'Trusted by Healthcare Institutions Across Kenya',
    sub: 'Over 200 institutions rely on medithrex for quality equipment, fast delivery, and after-sales support.',
    image: photo3,
    cta: 'Get a Quote Today', ctaLink: '/quote',
    cta2: 'Our Story', cta2Link: '/about',
  },
];

const STATS = [
  { value: '200+',   label: 'Institutions Served' },
  { value: '1,500+', label: 'Products Available' },
  { value: '8+',     label: 'Years Experience' },
  { value: '47',     label: 'Kenyan Counties' },
];

const BRANDS = ['Touren', '2NK', 'Crown'];

const WHY_US = [
  { icon: <Shield size={28} />,    title: 'Genuine Products',      desc: 'All equipment comes with manufacturer certification and full warranty.' },
  { icon: <Truck size={28} />,     title: 'Nationwide Delivery',   desc: 'Fast, reliable delivery to all 47 counties across Kenya.' },
  { icon: <Headphones size={28} />,title: 'After-Sales Support',   desc: 'Dedicated technical team for installation, training, and maintenance.' },
  { icon: <Award size={28} />,     title: 'Competitive Pricing',   desc: 'Best market rates with flexible payment options including M-Pesa and invoicing.' },
];

const TESTIMONIALS = [
  { text: 'medithrex delivered our entire ICU setup on time and within budget. Their after-sales support and engineer installation has been truly exceptional.' },
  { text: "We've sourced our hematology and biochemistry analyzers from medithrex for years. Reliable equipment, genuine parts, and a team that always picks up the phone." },
  { text: 'The quote-to-delivery process was seamless. A highly professional team that understands the Kenyan healthcare context and the urgency of our work.' },
];

export default function HomePage() {
  const [slide,           setSlide]           = useState(0);
  const [products,        setProducts]        = useState([]);
  const [categories,      setCategories]      = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCats,     setLoadingCats]     = useState(true);

  // Auto-advance hero slides
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Fetch featured products
  useEffect(() => {
    axios.get('/api/products?featured=true&limit=8')
      .then(r => setProducts(r.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Fetch admin-managed categories (only active ones, sorted by sort_order)
  useEffect(() => {
    axios.get('/api/categories')
      .then(r => setCategories(r.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  const current = HERO_SLIDES[slide];

  return (
    <div className="home">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${current.image})` }} />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-label">Kenya's Medical Equipment Partner</div>
            <h1 className="hero-title">{current.title}</h1>
            <p className="hero-sub">{current.sub}</p>
            <div className="hero-actions">
              <Link to={current.ctaLink} className="btn btn-primary btn-lg">
                {current.cta} <ArrowRight size={18} />
              </Link>
              <Link to={current.cta2Link} className="btn btn-outline-white btn-lg">
                {current.cta2}
              </Link>
            </div>
            <div className="hero-trust">
              {['ISO Certified','KEBS Approved','Warranty Guaranteed'].map(t => (
                <span key={t}><CheckCircle size={14} /> {t}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot${i === slide ? ' active' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
        <a href={PRIMARY_PHONE.href} className="hero-call">
          <Phone size={16} /> {PRIMARY_PHONE.display}
        </a>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────── */}
      <div className="stats-bar">
        <div className="container stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES (from admin) ────────────────────────────────────────── */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-label">What We Offer</p>
              <h2 className="section-title">Equipment Categories</h2>
              <div className="divider" />
            </div>
            <Link to="/products" className="btn btn-outline">Browse Products <ArrowRight size={16} /></Link>
          </div>

          {loadingCats ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : categories.length === 0 ? (
            <div className="cats-empty">
              <ImagePlus size={40} strokeWidth={1} />
              <p>Categories will appear here once the admin adds them.</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="cat-card"
                >
                  <div className="cat-card-img">
                    {cat.image_url ? (
                      <img src={resolveAssetUrl(cat.image_url)} alt={cat.name} loading="lazy" />
                    ) : (
                      <div className="cat-card-no-img">
                        <ImagePlus size={32} />
                      </div>
                    )}
                    <div className="cat-card-overlay" />
                  </div>
                  <div className="cat-card-body">
                    <div className="cat-card-text">
                      <span className="cat-card-name">{cat.name}</span>
                      {cat.description && (
                        <span className="cat-card-desc">{cat.description}</span>
                      )}
                      {cat.product_count > 0 && (
                        <span className="cat-card-count">{cat.product_count} products</span>
                      )}
                    </div>
                    <ChevronRight size={18} className="cat-card-arrow" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────────────── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-label">Hand-Picked Selection</p>
              <h2 className="section-title">Featured Products</h2>
              <div className="divider" />
            </div>
            <Link to="/products" className="btn btn-outline">All Products <ArrowRight size={16} /></Link>
          </div>
          {loadingProducts ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="cats-empty">
              <p>Featured products will appear here once added by the admin.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY US ────────────────────────────────────────────────────────── */}
      <section className="section why-section">
        <div className="container">
          <div className="why-inner">
            <div className="why-left">
              <p className="section-label">Why Choose medithrex</p>
              <h2 className="section-title">Your Trusted Healthcare Equipment Partner</h2>
              <div className="divider" />
              <p className="why-desc">
                Since 2024, medithrex has been the go-to supplier for hospitals, clinics, diagnostic labs,
                and healthcare institutions with a Kenyan focus. We combine global-standard equipment
                with deep local market expertise.
              </p>
              <div className="why-checks">
                {['MOH Approved Supplier','Flexible Payment Terms','Engineer Installation Included','Staff Training Provided'].map(c => (
                  <div key={c} className="why-check"><CheckCircle size={18} /> {c}</div>
                ))}
              </div>
              <Link to="/about" className="btn btn-dark" style={{ marginTop: '24px' }}>
                Learn More About Us <ArrowRight size={16} />
              </Link>
            </div>
            <div className="why-right">
              {WHY_US.map(w => (
                <div key={w.title} className="why-card">
                  <div className="why-card-icon">{w.icon}</div>
                  <div>
                    <h4>{w.title}</h4>
                    <p>{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUOTE CTA ─────────────────────────────────────────────────────── */}
      <section className="quote-banner">
        <div className="container quote-banner-inner">
          <div className="quote-banner-text">
            <h2>Need Custom Equipment for Your Facility?</h2>
            <p>We supply single units to full hospital setups. Get a tailored quote within 24 hours.</p>
          </div>
          <div className="quote-banner-actions">
            <Link to="/quote" className="btn btn-primary btn-lg">Request a Quote <ArrowRight size={18} /></Link>
            <a href={PRIMARY_PHONE.href} className="btn btn-outline-white btn-lg"><Phone size={18} /> {PRIMARY_PHONE.display}</a>
            <a href={SECONDARY_PHONE.href} className="btn btn-outline-white btn-lg"><Phone size={18} /> {SECONDARY_PHONE.display}</a>
          </div>
        </div>
      </section>

      {/* ── BRANDS ────────────────────────────────────────────────────────── */}
      <section className="section brands-section">
        <div className="container">
          <p className="section-label" style={{ textAlign: 'center' }}>All Kenyan Popular Brands Available</p>
          <div className="brands-row">
            {BRANDS.map(b => <div key={b} className="brand-chip">{b}</div>)}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="section testimonials-section">
        <div className="container">
          <p className="section-label">What People Say</p>
          <h2 className="section-title">Trusted by Kenya's Healthcare Professionals</h2>
          <div className="divider" />
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
