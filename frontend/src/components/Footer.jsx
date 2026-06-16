import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from 'lucide-react';
import { BUSINESS_EMAIL, BUSINESS_LOCATION, PRIMARY_PHONE, SECONDARY_PHONE } from '../config/contact.js';
import medLogo from '../Assets/med.png';
import './Footer.css';

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('/api/categories')
      .then(({ data }) => setCategories((data || []).map((cat) => cat.name)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={medLogo} alt="Medithrex Logo" className="footer-logo-image" />
            </div>
            <p>
              Kenya's premier supplier of medical and laboratory equipment. Delivering quality,
              reliability, and innovation to healthcare institutions with a Kenyan focus since 2024.
            </p>
            <div className="footer-social">
              <Link to="/contact" aria-label="Facebook"><Facebook size={18} /></Link>
              <Link to="/contact" aria-label="Twitter"><Twitter size={18} /></Link>
              <Link to="/contact" aria-label="LinkedIn"><Linkedin size={18} /></Link>
              <Link to="/contact" aria-label="Instagram"><Instagram size={18} /></Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/"><ArrowRight size={12} /> Home</Link></li>
              <li><Link to="/products"><ArrowRight size={12} /> Products</Link></li>
              <li><Link to="/quote"><ArrowRight size={12} /> Request a Quote</Link></li>
              <li><Link to="/about"><ArrowRight size={12} /> About Us</Link></li>
              <li><Link to="/contact"><ArrowRight size={12} /> Contact</Link></li>
              <li><Link to="/register"><ArrowRight size={12} /> Create Account</Link></li>
              <li><Link to="/login"><ArrowRight size={12} /> Sign In</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Equipment Categories</h4>
            <ul>
              {categories.map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`}>
                    <ArrowRight size={12} /> {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Get In Touch</h4>
            <div className="footer-contacts">
              <div className="footer-contact-item">
                <Phone size={16} />
                <div>
                  <span>Call / WhatsApp</span>
                  <a href={PRIMARY_PHONE.href}>{PRIMARY_PHONE.display}</a>
                  <a href={SECONDARY_PHONE.href}>{SECONDARY_PHONE.display}</a>
                </div>
              </div>
               <div className="footer-contact-item">
                 <Mail size={16} />
                 <div>
                   <span>Email Us</span>
                   <a href={`mailto:${BUSINESS_EMAIL}`}>{BUSINESS_EMAIL}</a>
                 </div>
               </div>
              <div className="footer-contact-item">
                <MapPin size={16} />
                 <div>
                   <span>Our Location</span>
                   <p>{BUSINESS_LOCATION}</p>
                   <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>Nairobi CBD, Nairobi, Kenya</p>
                 </div>
              </div>
            </div>
            <Link to="/quote" className="btn btn-primary btn-sm" style={{ marginTop: '20px' }}>
              Request Quote
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} medithrex Medical Solutions. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/returns">Returns Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
