import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Seo from '../components/Seo.jsx';
import ProductCard from '../components/ProductCard.jsx';
import {
  ArrowRight, CheckCircle, Phone, Star, Shield, Truck, Headphones, Award,
  ChevronRight, ImagePlus, Search, Quote, BarChart3, Users, Package,
  Microscope, Stethoscope, Heart, Activity, Syringe, Bone,
  TestTube, Eye, Clock, Mail, MapPin, Play, ChevronLeft
} from 'lucide-react';
import photo1 from '../Assets/photo1.png';
import photo2 from '../Assets/photo2.png';
import photo3 from '../Assets/photo3.png';
import { PRIMARY_PHONE, SECONDARY_PHONE } from '../config/contact.js';
import { resolveAssetUrl } from '../utils/assets.js';

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
    sub: 'Over 200 institutions rely on Medithrex for quality equipment, fast delivery, and after-sales support.',
    image: photo3,
    cta: 'Get a Quote Today', ctaLink: '/quote',
    cta2: 'Our Story', cta2Link: '/about',
  },
];

const STATS = [
  { value: '200+', label: 'Institutions Served', icon: <Users size={20} /> },
  { value: '1,500+', label: 'Products Available', icon: <Package size={20} /> },
  { value: '2+', label: 'Years Experience', icon: <Clock size={20} /> },
  { value: '47', label: 'Kenyan Counties', icon: <MapPin size={20} /> },
];

const WHY_US = [
  { icon: <Shield size={24} />, title: 'Genuine Products', desc: 'All equipment comes with manufacturer certification and full warranty.' },
  { icon: <Truck size={24} />, title: 'Nationwide Delivery', desc: 'Fast, reliable delivery to all 47 counties across Kenya.' },
  { icon: <Headphones size={24} />, title: 'After-Sales Support', desc: 'Dedicated technical team for installation, training, and maintenance.' },
  { icon: <Award size={24} />, title: 'Competitive Pricing', desc: 'Best market rates with flexible payment options including M-Pesa and invoicing.' },
];

const TESTIMONIALS = [
  { text: 'Medithrex delivered our entire ICU setup on time and within budget. Their after-sales support and engineer installation has been truly exceptional.' },
  { text: "We've sourced our hematology and biochemistry analyzers from Medithrex for years. Reliable equipment, genuine parts, and a team that always picks up the phone." },
  { text: 'The quote-to-delivery process was seamless. A highly professional team that understands the Kenyan healthcare context and the urgency of our work.' },
];

const CATEGORY_ICONS = {
  'Medical Equipment': <Stethoscope size={32} />,
  'Laboratory Equipment': <Microscope size={32} />,
  'Surgical Instruments': <Syringe size={32} />,
  'Diagnostic Kits': <Activity size={32} />,
  'Hospital Furniture': <Heart size={32} />,
  'ICU & Critical Care': <Activity size={32} />,
};

const BRANDS = [
  { name: 'Touren', desc: 'Medical Equipment' },
  { name: '2NK', desc: 'Laboratory Solutions' },
  { name: 'Crown', desc: 'Surgical Instruments' },
  { name: 'Siemens', desc: 'Diagnostics' },
  { name: 'Philips', desc: 'Imaging' },
  { name: 'Roche', desc: 'Lab Diagnostics' },
];

const FLOATING_ICONS = [
  { icon: <Microscope size={24} />, x: '10%', y: '20%', delay: 0 },
  { icon: <Heart size={20} />, x: '85%', y: '15%', delay: 0.5 },
  { icon: <Activity size={22} />, x: '90%', y: '60%', delay: 1 },
  { icon: <Stethoscope size={18} />, x: '5%', y: '70%', delay: 1.5 },
  { icon: <TestTube size={20} />, x: '15%', y: '50%', delay: 2 },
  { icon: <Bone size={22} />, x: '80%', y: '40%', delay: 2.5 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const statsRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    axios.get('/api/products?featured=true&limit=8')
      .then(r => setProducts(r.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    axios.get('/api/categories')
      .then(r => setCategories(r.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  const current = HERO_SLIDES[slide];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen">
      <Seo
        title="Kenya's Leading Medical Equipment Supplier | Medithrex"
        description="Medithrex supplies hospitals, clinics, and laboratories in Kenya with medical and laboratory equipment, installation support, and trusted brands."
        url="https://medithrex.site/"
      />

      {/* ═══════════════════════════════════════════════════════════════════
         HERO SECTION
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] lg:min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 via-primary-dark/70 to-primary-dark/50 z-10" />
            <img
              src={current.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating Medical Icons */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden hidden lg:block">
          {FLOATING_ICONS.map((item, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10"
              style={{ left: item.x, top: item.y }}
              animate={{ y: [0, -15, 0], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 4, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              {item.icon}
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="container-custom relative z-30 pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="max-w-3xl">
            <motion.div
              key={slide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-[11px] font-semibold text-white/80 tracking-wide">Kenya's Medical Equipment Partner</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-extrabold text-white leading-[1.05] tracking-tight mb-5">
                {current.title}
              </h1>

              <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-xl mb-8">
                {current.sub}
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              key={`search-${slide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="relative max-w-xl"
              >
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search 1,500+ medical products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-36 py-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-secondary/50 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <button type="submit" className="px-5 py-2 bg-secondary text-white text-sm font-semibold rounded-lg hover:bg-secondary-600 transition-all">
                    Search
                  </button>
                </div>
              </form>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              key={`cta-${slide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <Link to={current.ctaLink} className="btn btn-lg bg-secondary text-white border-secondary hover:bg-secondary-600 hover:-translate-y-0.5 shadow-lg shadow-secondary/25">
                {current.cta} <ArrowRight size={16} />
              </Link>
              <Link to={current.cta2Link} className="btn btn-lg bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                {current.cta2}
              </Link>
              <a href={PRIMARY_PHONE.href} className="btn btn-lg bg-transparent text-white/70 border-white/10 hover:bg-white/5 hover:text-white">
                <Phone size={16} /> {PRIMARY_PHONE.display}
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              {['ISO Certified', 'KEBS Approved', 'Warranty Guaranteed', 'MOH Approved'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-white/50">
                  <CheckCircle size={13} className="text-secondary" /> {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Slide Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === slide ? 'w-10 bg-secondary' : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 right-8 z-30 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/30"
          >
            <span className="text-[10px] font-medium tracking-widest uppercase">Scroll</span>
            <div className="w-0.5 h-8 bg-white/20 rounded-full relative overflow-hidden">
              <motion.div
                animate={{ y: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-full h-1/2 bg-secondary rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
         STATS BAR
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative -mt-12 z-40 pb-8" ref={statsRef}>
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary-50 flex items-center justify-center text-primary">
                  {stat.icon}
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-charcoal-400 mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
         CATEGORIES SECTION
      ════════════════════════════════════════════════════════════════════ */}
      <section className="section section-muted" id="categories">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between gap-4 mb-12"
          >
            <div>
              <span className="section-eyebrow">What We Offer</span>
              <h2 className="section-title">Equipment Categories</h2>
              <p className="section-subtitle">Comprehensive medical equipment categories for every healthcare need</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 transition-colors">
              Browse All <ArrowRight size={15} />
            </Link>
          </motion.div>

          {loadingCats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[4/3] skeleton rounded-lg" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-border flex items-center justify-center mb-4">
                <ImagePlus size={28} className="text-charcoal-400" />
              </div>
              <p className="text-charcoal-400">Categories will appear here once the admin adds them.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div key={cat.id} variants={itemVariants}>
                  <Link
                    to={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="group relative block bg-white rounded-lg border border-border overflow-hidden hover:-translate-y-1 transition-all duration-300"
                    style={{
                      boxShadow: '0 1px 3px rgba(11,92,173,0.04)',
                    }}
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {cat.image_url ? (
                        <img
                          src={resolveAssetUrl(cat.image_url)}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
                          {CATEGORY_ICONS[cat.name] || <Package size={32} className="text-primary/40" />}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-charcoal group-hover:text-primary transition-colors">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-xs text-charcoal-400 mt-1 line-clamp-1">{cat.description}</p>
                      )}
                      {cat.product_count > 0 && (
                        <p className="text-[10px] text-charcoal-200 mt-2 font-medium">{cat.product_count} products</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/products" className="btn btn-outline">
              Browse All Categories <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
         FEATURED PRODUCTS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between gap-4 mb-12"
          >
            <div>
              <span className="section-eyebrow">Hand-Picked Selection</span>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Curated medical equipment selected for quality and reliability</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-700 transition-colors">
              View All <ArrowRight size={15} />
            </Link>
          </motion.div>

          {loadingProducts ? (
            <div className="products-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-lg border border-border overflow-hidden">
                  <div className="aspect-square skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 skeleton w-1/3" />
                    <div className="h-4 skeleton w-3/4" />
                    <div className="h-3 skeleton w-1/2" />
                    <div className="h-8 skeleton w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-border flex items-center justify-center mb-4">
                <Package size={28} className="text-charcoal-400" />
              </div>
              <p className="text-charcoal-400">Featured products will appear here once added by the admin.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => (
                <ProductCard key={p.id} product={p} featured />
              ))}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/products" className="btn btn-outline">
              View All Products <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
         WHY CHOOSE US
      ════════════════════════════════════════════════════════════════════ */}
      <section className="section section-muted">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-eyebrow">Why Choose Medithrex</span>
              <h2 className="section-title mb-4">Your Trusted Healthcare Equipment Partner</h2>
              <div className="divider-secondary" />
              <p className="text-base text-charcoal-400 leading-relaxed mb-6">
                Since 2024, Medithrex has been the go-to supplier for hospitals, clinics, diagnostic labs,
                and healthcare institutions with a Kenyan focus. We combine global-standard equipment
                with deep local market expertise.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['MOH Approved Supplier', 'Flexible Payment Terms', 'Engineer Installation', 'Staff Training Provided'].map(c => (
                  <div key={c} className="flex items-center gap-2 text-sm text-charcoal-600">
                    <CheckCircle size={16} className="text-secondary shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn btn-primary">
                Learn More About Us <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {WHY_US.map((w, i) => (
                <motion.div
                  key={w.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="premium-card p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary mb-4">
                    {w.icon}
                  </div>
                  <h4 className="text-base font-bold text-charcoal mb-2">{w.title}</h4>
                  <p className="text-sm text-charcoal-400 leading-relaxed">{w.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
         QUOTE CTA BANNER
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary-dark via-primary to-primary-700 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-4">
                  <Quote size={12} /> Need Custom Equipment?
                </span>
                <h2 className="text-3xl lg:text-4xl font-display font-extrabold text-white leading-tight mb-4">
                  Get a Tailored Quote Within 24 Hours
                </h2>
                <p className="text-white/60 text-base leading-relaxed">
                  We supply single units to full hospital setups. Our team will work with you to find the perfect equipment for your facility.
                </p>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 shrink-0"
            >
              <Link to="/quote" className="btn btn-lg bg-secondary text-white border-secondary hover:bg-secondary-600 shadow-lg shadow-secondary/25">
                Request a Quote <ArrowRight size={18} />
              </Link>
              <a href={PRIMARY_PHONE.href} className="btn btn-lg bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                <Phone size={18} /> {PRIMARY_PHONE.display}
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
         BRANDS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="section-eyebrow justify-center">Our Partners</span>
            <h2 className="section-title">Trusted Brands We Represent</h2>
            <p className="section-subtitle mx-auto">Partnering with world-leading medical equipment manufacturers</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BRANDS.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="premium-card p-6 text-center hover:border-primary-100"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                  <span className="text-lg font-bold gradient-text">{brand.name.charAt(0)}</span>
                </div>
                <p className="text-sm font-bold text-charcoal">{brand.name}</p>
                <p className="text-[10px] text-charcoal-400 mt-0.5">{brand.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
         TESTIMONIALS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="section section-muted">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="section-eyebrow justify-center">Testimonials</span>
            <h2 className="section-title">Trusted by Kenya's Healthcare Professionals</h2>
            <p className="section-subtitle mx-auto">Hear from our satisfied clients across the healthcare sector</p>
          </motion.div>

<div className="grid md:grid-cols-3 gap-6">
             {TESTIMONIALS.map((t, i) => (
               <motion.div
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="premium-card p-6 relative"
               >
                 <div className="flex items-center gap-0.5 mb-4">
                   {[...Array(5)].map((_, s) => (
                     <Star key={s} size={14} className="fill-warning text-warning" />
                   ))}
                 </div>
                 <p className="text-sm text-charcoal-600 leading-relaxed mb-4 italic">"{t.text}"</p>
               </motion.div>
             ))}
           </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
         NEWSLETTER CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section className="section bg-primary-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/5 to-transparent" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-eyebrow section-eyebrow-white justify-center">Stay Updated</span>
              <h2 className="section-title section-title-white mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
                Get the latest medical equipment updates, industry news, and exclusive offers delivered to your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-secondary transition-all"
                />
                <button type="submit" className="px-6 py-3 bg-secondary text-white text-sm font-semibold rounded-lg hover:bg-secondary-600 transition-all whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}