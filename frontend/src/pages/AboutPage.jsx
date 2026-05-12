import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, MapPin, Award, Truck } from 'lucide-react';
import fidelPhoto from '../Assets/fidel.png';
import christlayPhoto from '../Assets/chris.png';
import './AboutPage.css';

const TEAM = [
  { name: 'Fidel Chimwani',  role: 'CEO & Co-Founder', photo: fidelPhoto, bio: 'Leads Medithrex vision, strategy and partnerships with a Kenyan focus.' },
  { name: 'Christlay Muhanji', role: 'CEO & Co-Founder', photo: christlayPhoto, bio: 'Drives operations, product sourcing, and institutional client relations.' },
];

const VALUES = [
  { icon: <Award size={28} />,     title: 'Quality Assurance',  desc: 'Every product we supply meets international standards — ISO, CE, and KEBS certified.' },
  { icon: <Users size={28} />,     title: 'Customer First',     desc: 'We build lasting relationships with healthcare institutions by prioritising their needs.' },
  { icon: <MapPin size={28} />,    title: 'Local Expertise',    desc: "Deep knowledge of Kenya's healthcare landscape and regulatory environment." },
  { icon: <Truck size={28} />,     title: 'Reliable Delivery',  desc: 'Nationwide logistics network ensuring timely delivery to all 47 counties.' },
];

export default function AboutPage() {
  return (
    <div className="about-page">

      {/* Hero */}
      <div className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">Our Story</p>
          <h1>About Medithrex</h1>
          <p>Empowering Kenya's healthcare sector with world-class medical and laboratory equipment since 2024.</p>
        </div>
      </div>

      {/* Mission */}
      <section className="section about-mission">
        <div className="container about-mission-grid">
          <div className="mission-img">
            {/* Kenyan hospital / clinic image */}
            <img
              src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?w=700&q=80"
              alt="Healthcare professionals in Kenya"
            />
            <div className="mission-badge">
              <span className="mission-badge-num">2+</span>
              <span>Years of Excellence</span>
            </div>
          </div>

          <div className="mission-content">
            <p className="section-label">Who We Are</p>
            <h2 className="section-title">Kenya's Trusted Medical Equipment Partner</h2>
            <div className="divider" />
            <p>
              Medithrex Medical Solutions is a leading supplier of medical and laboratory equipment to hospitals,
              clinics, diagnostic centres, universities, and research institutions with a Kenyan focus.
            </p>
            <p>
              Founded in Nairobi in 2024 and headquartered at Pramukh Plaza, Nairobi CBD — Shop 19 — we have
              grown from a focused distributor into a comprehensive medical equipment solutions provider, serving
              over 200 institutions in all 47 counties of Kenya.
            </p>
            <div className="mission-checks">
              {['MOH Registered Supplier','KEBS Certified Products','ISO 9001 Quality Management','Trained Technical Team','After-Sales & Maintenance'].map(c => (
                <div key={c} className="mission-check"><CheckCircle size={16} /> {c}</div>
              ))}
            </div>
            <Link to="/contact" className="btn btn-primary" style={{ marginTop: '24px' }}>
              Get In Touch <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats-bar">
        <div className="container about-stats-grid">
          {[
            { val: '200+', label: 'Institutions Served' },
            { val: '1,500+', label: 'Products Supplied' },
            { val: '47', label: 'Counties Reached' },
            { val: '3+', label: 'Years Experience' },
            { val: '98%', label: 'Client Satisfaction' },
          ].map(s => (
            <div key={s.label} className="about-stat">
              <span className="about-stat-val">{s.val}</span>
              <span className="about-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="section values-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p className="section-label">What Drives Us</p>
            <h2 className="section-title">Our Core Values</h2>
            <div className="divider divider-center" />
          </div>
          <div className="values-grid">
            {VALUES.map(v => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section team-section">
        <div className="container">
          <div style={{ marginBottom: '40px' }}>
            <p className="section-label">The People Behind Medithrex</p>
            <h2 className="section-title">Our Founders</h2>
            <div className="divider" />
          </div>
          <div className="founders-grid">
            {TEAM.map(m => (
              <div key={m.name} className="founder-card">
                <div className="founder-avatar">
                  <img src={m.photo} alt={m.name} loading="lazy" />
                </div>
                <div className="founder-info">
                  <h4>{m.name}</h4>
                  <span className="founder-role">{m.role}</span>
                  <p className="founder-bio">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section location-section">
        <div className="container location-inner">
          <div className="location-text">
            <p className="section-label">Find Us</p>
            <h2 className="section-title">Visit Our Showroom</h2>
            <div className="divider" />
            <div className="location-details">
               <div className="location-row">
                 <MapPin size={20} />
                 <div>
                   <strong>Pramukh Plaza — 3rd Floor Shop 19</strong>
                   <p>Nairobi CBD, Nairobi, Kenya</p>
                 </div>
               </div>
               <div className="location-row">
                 <span className="location-icon">📞</span>
                 <div>
                   <strong>0790 080 903</strong>
                   <p>Call</p>
                 </div>
               </div>
               <div className="location-row">
                 <span className="location-icon">📱</span>
                 <div>
                   <strong>0790 080 903</strong>
                   <p>WhatsApp</p>
                 </div>
               </div>
              <div className="location-row">
                <span className="location-icon">🕒</span>
                <div>
                  <strong>Mon – Fri: 8:00 AM – 6:00 PM</strong>
                  <p>Saturday: 9:00 AM – 2:00 PM EAT</p>
                </div>
              </div>
            </div>
            <Link to="/contact" className="btn btn-primary" style={{ marginTop: '24px' }}>
              Get Directions <ArrowRight size={16} />
            </Link>
          </div>
          <div className="location-map">
            <iframe
              title="Medithrex Location — Pramukh Plaza, Nairobi CBD"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8185987700456!2d36.8175!3d-1.2833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d22ef9aaab%3A0x9da5b6c6c0b9c4e0!2sNairobi+CBD!5e0!3m2!1sen!2ske!4v1"
              width="100%" height="340" style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container about-cta-inner">
          <div>
            <h2>Ready to Equip Your Facility?</h2>
            <p>Contact us today for a consultation and customised quote.</p>
          </div>
          <div className="about-cta-btns">
            <Link to="/quote"    className="btn btn-primary btn-lg">Request a Quote <ArrowRight size={18} /></Link>
            <Link to="/products" className="btn btn-outline-white btn-lg">Browse Products</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
