import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import {
  Award, Shield, Heart, Users, Target, Eye, ChevronRight, Star,
  CheckCircle, ArrowRight, Quote
} from 'lucide-react';

const timeline = [
  { year: '2024', title: 'Founded in Nairobi', desc: 'Medithrex was established to bridge the gap in quality medical equipment supply in Kenya.' },
  { year: '2024 Q2', title: 'First Major Contract', desc: 'Secured our first hospital equipment supply contract with a leading Nairobi hospital.' },
  { year: '2025', title: 'Expanded Product Range', desc: 'Grew our catalog to 1,500+ products across all medical equipment categories.' },
  { year: '2026', title: 'Nationwide Coverage', desc: 'Now serving clients across all 47 counties in Kenya with dedicated logistics.' },
];

const values = [
  { icon: <Shield size={28} />, title: 'Quality Assurance', desc: 'All equipment is certified and meets international medical standards.' },
  { icon: <Heart size={28} />, title: 'Patient-Centered', desc: 'We believe better equipment leads to better patient outcomes.' },
  { icon: <Users size={28} />, title: 'Partnership', desc: 'We build long-term relationships with our clients and partners.' },
  { icon: <Target size={28} />, title: 'Excellence', desc: 'We strive for excellence in every product we supply and service we provide.' },
  { icon: <Eye size={28} />, title: 'Transparency', desc: 'Clear pricing, honest communication, and reliable delivery.' },
  { icon: <Award size={28} />, title: 'Innovation', desc: 'We continuously update our offerings with the latest medical technology.' },
];

const team = [
  { name: 'Christlay Muhanji', role: 'CEO & Co-Founder', initials: 'CM' },
  { name: 'Fidel Chimwani', role: 'Co-Founder', initials: 'FC' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Seo title="About Medithrex | Kenya's Medical Equipment Partner" description="Learn about Medithrex's mission, vision, and commitment to providing quality medical equipment across Kenya." />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="page-hero pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="container-custom page-hero-content">
          <div className="page-hero-breadcrumb">
            <Link to="/">Home</Link> <ChevronRight size={10} /> <span>About</span>
          </div>
          <h1>About Medithrex</h1>
          <p>Kenya's trusted partner in medical equipment and healthcare solutions</p>
        </div>
      </section>

      {/* ── Mission & Vision ────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="premium-card p-8 lg:p-10"
            >
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center text-primary mb-5">
                <Target size={28} />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-3">Our Mission</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                To provide Kenyan healthcare institutions with access to high-quality, certified medical equipment 
                at competitive prices, supported by exceptional after-sales service and technical expertise.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="premium-card p-8 lg:p-10"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary-50 flex items-center justify-center text-secondary mb-5">
                <Eye size={28} />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-3">Our Vision</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                To be Kenya's most trusted medical equipment partner — empowering healthcare providers 
                with world-class technology, reliable supply chains, and unmatched local support.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Story / Timeline ────────────────────────────────────────────── */}
      <section className="section section-muted">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="section-eyebrow justify-center">Our Journey</span>
            <h2 className="section-title">How We Started</h2>
            <p className="section-subtitle mx-auto">From a vision to Kenya's trusted medical equipment partner</p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-20"
                >
                  <div className="absolute left-4 top-1 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md">
                    {i + 1}
                  </div>
                  <div className="premium-card p-5">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{item.year}</span>
                    <h4 className="text-base font-bold text-charcoal mt-1">{item.title}</h4>
                    <p className="text-sm text-charcoal-400 mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="section-eyebrow justify-center">What We Stand For</span>
            <h2 className="section-title">Core Values</h2>
            <p className="section-subtitle mx-auto">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="premium-card p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary mb-4">{v.icon}</div>
                <h4 className="text-base font-bold text-charcoal mb-2">{v.title}</h4>
                <p className="text-sm text-charcoal-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership ──────────────────────────────────────────────────── */}
      <section className="section section-muted">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="section-eyebrow justify-center">Leadership</span>
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle mx-auto">Experienced professionals dedicated to healthcare excellence</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-lg mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="premium-card p-6 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                  {member.initials}
                </div>
                <h4 className="text-base font-bold text-charcoal">{member.name}</h4>
                <p className="text-xs text-charcoal-400 mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="section bg-primary-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title section-title-white mb-4">Ready to Work With Us?</h2>
            <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
              Get in touch with our team to discuss your medical equipment needs
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn btn-lg bg-secondary text-white border-secondary hover:bg-secondary-600">
                Contact Us <ArrowRight size={16} />
              </Link>
              <Link to="/quote" className="btn btn-lg bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                Request a Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}