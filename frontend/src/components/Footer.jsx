import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone, Mail, MapPin, Clock, ArrowUpRight, ChevronRight,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Shield, Truck, Headphones, Award
} from 'lucide-react';
import { PRIMARY_PHONE, SECONDARY_PHONE, EMAIL, ADDRESS } from '../config/contact.js';
import logo from '../Assets/med.png';

const FOOTER_LINKS = {
  'Quick Links': [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Request Quote', path: '/quote' },
  ],
  'Categories': [
    { name: 'Medical Equipment', path: '/products?category=Medical+Equipment' },
    { name: 'Laboratory Equipment', path: '/products?category=Laboratory+Equipment' },
    { name: 'Surgical Instruments', path: '/products?category=Surgical+Instruments' },
    { name: 'Diagnostic Kits', path: '/products?category=Diagnostic+Kits' },
    { name: 'Hospital Furniture', path: '/products?category=Hospital+Furniture' },
    { name: 'All Categories', path: '/products' },
  ],
  'Support': [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'Returns Policy', path: '/returns-policy' },
    { name: 'FAQ', path: '/contact#faq' },
    { name: 'Track Order', path: '/account/orders' },
  ],
};

const SOCIAL_LINKS = [
  { icon: <Facebook size={16} />, href: '#', label: 'Facebook' },
  { icon: <Twitter size={16} />, href: '#', label: 'Twitter' },
  { icon: <Instagram size={16} />, href: '#', label: 'Instagram' },
  { icon: <Linkedin size={16} />, href: '#', label: 'LinkedIn' },
  { icon: <Youtube size={16} />, href: '#', label: 'YouTube' },
];

const FEATURES = [
  { icon: <Shield size={18} />, title: 'Genuine Products', desc: '100% authentic, certified medical equipment' },
  { icon: <Truck size={18} />, title: 'Nationwide Delivery', desc: 'Fast shipping to all 47 counties' },
  { icon: <Headphones size={18} />, title: '24/7 Support', desc: 'Dedicated technical assistance team' },
  { icon: <Award size={18} />, title: 'Warranty Included', desc: 'Full manufacturer warranty on all items' },
];

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      {/* ── Features Bar ────────────────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-secondary shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-[11px] text-white/40">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Footer ─────────────────────────────────────────────────── */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <img src={logo} alt="Medithrex" className="h-10 w-auto" />
              <div>
                <span className="text-xl font-bold tracking-tight text-white">Medithrex</span>
                <span className="block text-[10px] font-medium text-secondary tracking-[0.2em] uppercase">Medical Equipment</span>
              </div>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-sm">
              Kenya's premier medical equipment supplier, serving hospitals, clinics, laboratories, 
              and healthcare institutions across all 47 counties with world-class products and support.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-secondary mt-0.5 shrink-0" />
                <span className="text-sm text-white/50">{ADDRESS || 'Nairobi, Kenya'}</span>
              </div>
              <a href={PRIMARY_PHONE.href} className="flex items-center gap-3 group">
                <Phone size={15} className="text-secondary shrink-0" />
                <span className="text-sm text-white/50 group-hover:text-secondary transition-colors">{PRIMARY_PHONE.display}</span>
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 group">
                <Mail size={15} className="text-secondary shrink-0" />
                <span className="text-sm text-white/50 group-hover:text-secondary transition-colors">{EMAIL}</span>
              </a>
              <div className="flex items-center gap-3">
                <Clock size={15} className="text-secondary shrink-0" />
                <span className="text-sm text-white/50">Mon–Sat: 8:00 AM – 6:00 PM</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-secondary hover:text-white transition-all duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white mb-5 tracking-wide">{title}</h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-1.5 text-sm text-white/40 hover:text-secondary transition-colors group"
                    >
                      <ChevronRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Medithrex. All rights reserved. 
            <span className="hidden sm:inline"> — Kenya's Trusted Medical Equipment Partner.</span>
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <Link to="/privacy-policy" className="hover:text-secondary transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-secondary transition-colors">Terms</Link>
            <Link to="/returns-policy" className="hover:text-secondary transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}