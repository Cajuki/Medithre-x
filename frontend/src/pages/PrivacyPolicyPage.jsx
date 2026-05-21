import { Link } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';

const LAST_UPDATED = '1 June 2025';

function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 48, scrollMarginTop: 90 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--black)', borderLeft: '4px solid var(--yellow)', paddingLeft: 16, marginBottom: 18, lineHeight: 1.2 }}>
        {title}
      </h2>
      <div style={{ fontSize: '0.9375rem', color: '#444', lineHeight: 1.9 }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }) {
  return <p style={{ marginBottom: 14 }}>{children}</p>;
}

function Ul({ items }) {
  return (
    <ul style={{ paddingLeft: 20, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ position: 'relative', paddingLeft: 6 }}>
          <span style={{ position: 'absolute', left: -14, color: 'var(--yellow-600)', fontWeight: 700 }}>•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

const TOC = [
  { id: 'collection',   label: 'Information We Collect' },
  { id: 'use',          label: 'How We Use Your Information' },
  { id: 'sharing',      label: 'How We Share Your Information' },
  { id: 'cookies',      label: 'Cookies & Tracking' },
  { id: 'security',     label: 'Data Security' },
  { id: 'retention',    label: 'Data Retention' },
  { id: 'rights',       label: 'Your Rights' },
  { id: 'third-party',  label: 'Third-Party Services' },
  { id: 'children',     label: "Children's Privacy" },
  { id: 'changes',      label: 'Changes to This Policy' },
  { id: 'contact',      label: 'Contact Us' },
];

export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '52px 0 44px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%', background: 'linear-gradient(135deg, transparent 40%, rgba(245,195,0,0.04))', pointerEvents: 'none' }}/>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={12}/>
            <span style={{ color: 'var(--yellow)' }}>Privacy Policy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, background: 'var(--yellow)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield size={24} color="var(--black)"/>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 900, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Privacy Policy</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', maxWidth: 560 }}>
            This policy explains how Medithrex Medical Solutions collects, uses, and protects your personal information when you use our website and services in Kenya.
          </p>
          <div style={{ marginTop: 16, display: 'inline-block', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 16px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
            Last updated: {LAST_UPDATED}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '52px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 52, alignItems: 'start' }}>

          {/* Sticky TOC */}
          <nav style={{ position: 'sticky', top: 90, background: 'var(--white)', border: '1px solid var(--white-200)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--black)', padding: '14px 18px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--white)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Contents</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {TOC.map((item, i) => (
                <a key={item.id} href={`#${item.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px', fontSize: '0.8125rem', color: 'var(--grey-600)', textDecoration: 'none', transition: 'var(--trans)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--yellow-50)'; e.currentTarget.style.color = 'var(--black)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--grey-600)'; }}>
                  <span style={{ width: 20, height: 20, background: 'var(--yellow)', color: 'var(--black)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.6rem', flexShrink: 0 }}>{i + 1}</span>
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div>
            <div style={{ background: 'var(--yellow-50)', border: '1px solid rgba(245,195,0,0.3)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 40, fontSize: '0.875rem', color: 'var(--grey-700)', lineHeight: 1.7 }}>
              <strong>Summary:</strong> Medithrex Medical Solutions ("we", "us", "our") is committed to protecting your privacy in accordance with the <strong>Kenya Data Protection Act, 2019</strong> and applicable Kenyan laws. We collect only the information necessary to provide our services and will never sell your personal data.
            </div>

            <Section id="collection" title="1. Information We Collect">
              <P>We collect the following categories of personal information when you visit our website, create an account, place an order, or contact us:</P>
              <Ul items={[
                'Full name and contact details (email address, phone number)',
                'Delivery address including city, county and country',
                'Institution or company name and county of operation',
                'Order history, product enquiries and quote requests',
                'Payment reference details (M-Pesa transaction codes, bank references — we do not store card numbers)',
                'Communications you send us through the contact form, email or WhatsApp',
                'Device and browser information collected automatically when you visit our site (IP address, browser type, pages visited)',
              ]}/>
              <P>We collect this information directly from you when you fill in forms on our website, or automatically through cookies and analytics tools.</P>
            </Section>

            <Section id="use" title="2. How We Use Your Information">
              <P>We use your personal information strictly to:</P>
              <Ul items={[
                'Process and fulfil your orders and equipment requests',
                'Send order confirmations, delivery updates and invoices via email and SMS',
                'Respond to quote requests, product enquiries and customer support queries',
                'Verify your identity and prevent fraudulent transactions',
                'Send you relevant product updates and promotions — only if you have opted in',
                'Comply with Kenya Revenue Authority (KRA) requirements for invoicing and tax records',
                'Improve our website experience using anonymised analytics data',
                'Comply with legal obligations under Kenyan law',
              ]}/>
              <P>We will never use your information for purposes that are incompatible with those listed above without first obtaining your consent.</P>
            </Section>

            <Section id="sharing" title="3. How We Share Your Information">
              <P>We do <strong>not sell, rent or trade</strong> your personal information to any third party. We only share your information with:</P>
              <Ul items={[
                'Delivery and logistics partners (e.g. courier services) — only your name, phone number and delivery address, solely to complete your delivery',
                'Safaricom M-Pesa (Daraja API) — to process mobile money payments; your phone number is shared only for the purpose of sending payment prompts',
                "Africa's Talking — our SMS service provider — to deliver order and delivery notifications to your mobile number",
                'Cloudinary — our image hosting service — which stores product and category images (no personal data)',
                'Legal authorities — only when required by a valid court order, subpoena or applicable Kenyan law',
              ]}/>
              <P>All third-party service providers are contractually required to handle your data in a manner consistent with this policy.</P>
            </Section>

            <Section id="cookies" title="4. Cookies & Tracking">
              <P>Our website uses cookies and similar technologies to:</P>
              <Ul items={[
                'Keep you logged in to your account (session cookies)',
                'Remember items in your shopping cart',
                'Analyse website traffic and usage patterns using anonymised data',
                'Improve website performance and user experience',
              ]}/>
              <P>You can control cookie settings through your browser. Disabling certain cookies may affect website functionality such as staying logged in or maintaining your cart.</P>
            </Section>

            <Section id="security" title="5. Data Security">
              <P>We take data security seriously and implement the following measures to protect your information:</P>
              <Ul items={[
                'All passwords are hashed using bcrypt (cost factor 10) — plain-text passwords are never stored',
                'User sessions are managed using JWT tokens with a 7-day expiry',
                'Our backend runs over HTTPS with SSL/TLS encryption',
                'Our database (hosted on Neon PostgreSQL) uses encrypted connections (SSL required)',
                'Payment transactions are processed through Safaricom\'s secure M-Pesa Daraja API',
                'Access to the admin panel is restricted to authorised personnel only',
              ]}/>
              <P>While we take all reasonable precautions, no internet transmission is 100% secure. If you suspect unauthorised access to your account, please contact us immediately at <a href="mailto:info@medithrex.co.ke" style={{ color: 'var(--black)', fontWeight: 600 }}>info@medithrex.co.ke</a>.</P>
            </Section>

            <Section id="retention" title="6. Data Retention">
              <P>We retain your personal data for as long as necessary to:</P>
              <Ul items={[
                'Maintain your account and provide our services',
                'Comply with KRA tax record requirements (minimum 5 years for invoices and transaction records)',
                'Resolve disputes and enforce our legal agreements',
              ]}/>
              <P>When you request deletion of your account, we will remove your personal data within 30 days, except where retention is required by law.</P>
            </Section>

            <Section id="rights" title="7. Your Rights">
              <P>Under the <strong>Kenya Data Protection Act, 2019</strong>, you have the following rights regarding your personal data:</P>
              <Ul items={[
                'Right to access — you can request a copy of the personal data we hold about you',
                'Right to correction — you can update or correct inaccurate information through your account settings',
                'Right to erasure — you can request deletion of your personal data, subject to legal retention requirements',
                'Right to object — you can opt out of marketing communications at any time',
                'Right to data portability — you can request your data in a structured, machine-readable format',
                'Right to lodge a complaint with the Office of the Data Protection Commissioner (ODPC) Kenya',
              ]}/>
              <P>To exercise any of these rights, contact us at <a href="mailto:info@medithrex.co.ke" style={{ color: 'var(--black)', fontWeight: 600 }}>info@medithrex.co.ke</a> or call <a href="tel:0790080903" style={{ color: 'var(--black)', fontWeight: 600 }}>0790 080 903</a>. We will respond within 30 days.</P>
            </Section>

            <Section id="third-party" title="8. Third-Party Services">
              <P>Our website integrates with the following third-party services, each governed by their own privacy policies:</P>
              <Ul items={[
                'Safaricom M-Pesa (Daraja API) — mobile payments',
                "Africa's Talking — SMS notifications",
                'Cloudinary — image storage and delivery',
                'Google Fonts — typography (fonts are loaded from Google\'s CDN)',
                'Google Maps — embedded maps on our Contact and About pages',
                'Neon PostgreSQL — database hosting (EU/US data centres)',
              ]}/>
              <P>We encourage you to review the privacy policies of these third-party services if you have concerns about how they handle data.</P>
            </Section>

            <Section id="children" title="9. Children's Privacy">
              <P>Our services are intended for healthcare professionals, institutions and adults aged 18 and above. We do not knowingly collect personal information from persons under 18 years of age. If you believe a minor has submitted personal data to us, please contact us immediately so we can delete it.</P>
            </Section>

            <Section id="changes" title="10. Changes to This Policy">
              <P>We may update this Privacy Policy periodically to reflect changes in our practices or applicable Kenyan law. When we make significant changes, we will:</P>
              <Ul items={[
                'Update the "Last updated" date at the top of this page',
                'Notify registered users via email',
                'Display a notice on our website homepage for 30 days',
              ]}/>
              <P>Your continued use of our website after changes are posted constitutes acceptance of the updated policy.</P>
            </Section>

            <Section id="contact" title="11. Contact Us">
              <P>For any privacy-related queries, requests or complaints, please contact our Data Protection Officer:</P>
              <div style={{ background: 'var(--black)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginTop: 8 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--white)', marginBottom: 16 }}>Medithrex Medical Solutions</div>
                {[
                  ['Address', 'Pramukh Plaza — Shop 19, Nairobi CBD, Nairobi, Kenya'],
                  ['Email',   'info@medithrex.co.ke'],
                  ['Phone',   '0790 080 903'],
                  ['Hours',   'Monday – Friday: 8:00 AM – 6:00 PM EAT'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', minWidth: 60, paddingTop: 2 }}>{l}</span>
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{v}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 12, paddingTop: 24, borderTop: '1px solid var(--white-200)', flexWrap: 'wrap' }}>
              <Link to="/terms" className="btn btn-outline btn-sm">Terms of Service →</Link>
              <Link to="/returns" className="btn btn-outline btn-sm">Returns Policy →</Link>
              <Link to="/contact" className="btn btn-dark btn-sm">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
