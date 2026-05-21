import { Link } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';

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

function P({ children }) { return <p style={{ marginBottom: 14 }}>{children}</p>; }

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
  { id: 'acceptance',     label: 'Acceptance of Terms' },
  { id: 'services',       label: 'Our Services' },
  { id: 'accounts',       label: 'User Accounts' },
  { id: 'orders',         label: 'Orders & Pricing' },
  { id: 'payment',        label: 'Payment Terms' },
  { id: 'delivery',       label: 'Delivery & Shipping' },
  { id: 'warranty',       label: 'Warranty & Guarantee' },
  { id: 'intellectual',   label: 'Intellectual Property' },
  { id: 'liability',      label: 'Limitation of Liability' },
  { id: 'prohibited',     label: 'Prohibited Conduct' },
  { id: 'governing',      label: 'Governing Law' },
  { id: 'changes',        label: 'Changes to Terms' },
  { id: 'contact',        label: 'Contact Us' },
];

export default function TermsOfServicePage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '52px 0 44px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%', background: 'linear-gradient(135deg, transparent 40%, rgba(245,195,0,0.04))', pointerEvents: 'none' }}/>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={12}/>
            <span style={{ color: 'var(--yellow)' }}>Terms of Service</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, background: 'var(--yellow)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={24} color="var(--black)"/>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 900, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Terms of Service</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', maxWidth: 580 }}>
            Please read these terms carefully before using our website or placing any order. By using Medithrex, you agree to be bound by these terms.
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
              <strong>Summary:</strong> These Terms of Service govern your use of the Medithrex Medical Solutions website and the purchase of products through our platform. These terms are governed by the laws of Kenya, including the <strong>Consumer Protection Act, 2012</strong>, the <strong>Electronic Transactions Act, 2023</strong>, and other applicable Kenyan legislation.
            </div>

            <Section id="acceptance" title="1. Acceptance of Terms">
              <P>By accessing or using the Medithrex website at <strong>medithrex.co.ke</strong>, creating an account, placing an order, or submitting a quote request, you confirm that:</P>
              <Ul items={[
                'You are at least 18 years of age or a duly authorised representative of a registered institution',
                'You have read, understood and agree to be bound by these Terms of Service',
                'You agree to comply with all applicable Kenyan laws and regulations',
                'You have the authority to enter into a binding agreement on behalf of yourself or your institution',
              ]}/>
              <P>If you do not agree to these terms, please do not use our website or services. Medithrex reserves the right to refuse service to anyone at any time.</P>
            </Section>

            <Section id="services" title="2. Our Services">
              <P>Medithrex Medical Solutions provides:</P>
              <Ul items={[
                'An online catalogue and purchasing platform for medical and laboratory equipment',
                'Equipment quotation and tendering services for hospitals, clinics, and institutions',
                'Delivery, installation, and commissioning of medical equipment across Kenya',
                'After-sales support, maintenance, and technical assistance',
                'Staff training on the use and maintenance of supplied equipment',
              ]}/>
              <P>We serve customers in all 47 counties of Kenya. We reserve the right to modify, suspend or discontinue any aspect of our services at any time with reasonable notice.</P>
            </Section>

            <Section id="accounts" title="3. User Accounts">
              <P>When you create an account with Medithrex, you agree to:</P>
              <Ul items={[
                'Provide accurate, current and complete information during registration',
                'Maintain and promptly update your account information',
                'Keep your password confidential and not share it with any third party',
                'Notify us immediately at info@medithrex.co.ke if you suspect unauthorised access to your account',
                'Accept responsibility for all activity that occurs under your account',
              ]}/>
              <P>Medithrex reserves the right to suspend or terminate accounts that provide false information, violate these terms, or engage in fraudulent activity. We will attempt to notify you before taking such action except where immediate action is required to prevent harm.</P>
            </Section>

            <Section id="orders" title="4. Orders & Pricing">
              <P>All prices displayed on our website are in <strong>Kenyan Shillings (KES)</strong> and are exclusive of VAT at the prevailing rate (currently 16%) unless stated otherwise. Prices are subject to change without notice.</P>
              <Ul items={[
                'An order confirmation email constitutes acceptance of your order by Medithrex',
                'We reserve the right to cancel any order if a pricing error has occurred, stock is unavailable, or payment is not received',
                'For "Price on Request" items, a formal quotation will be issued within 24 hours of your request',
                'Bulk order discounts are available — contact our sales team for institutional pricing',
                'All quotations are valid for 30 days from the date of issue unless stated otherwise',
                'We reserve the right to amend quoted prices if there are changes in import duties, exchange rates, or supplier pricing before delivery',
              ]}/>
              <P>Medithrex is not responsible for typographical errors in pricing. We will notify you of any pricing discrepancy before processing your order.</P>
            </Section>

            <Section id="payment" title="5. Payment Terms">
              <P>We accept the following payment methods:</P>
              <Ul items={[
                'M-Pesa Lipa Na M-Pesa (Paybill and STK Push) — instant payment confirmation',
                'Bank transfer to our KCB Bank account — payment must be received before dispatch',
                'Institutional LPO (Local Purchase Order) — NET 30 days for pre-approved institutions',
                'Cheque payments — payable to "Medithrex Medical Solutions Ltd"',
                'Credit/debit card payments through our secure payment gateway',
              ]}/>
              <P>For LPO customers, invoices are payable within <strong>30 days</strong> of the invoice date. Overdue accounts will attract interest at <strong>2% per month</strong> on the outstanding balance, in accordance with the Late Payment of Commercial Debts provisions under Kenyan law.</P>
              <P>We reserve the right to withhold delivery or future orders on accounts with outstanding balances.</P>
            </Section>

            <Section id="delivery" title="6. Delivery & Shipping">
              <Ul items={[
                'We deliver to all 47 counties across Kenya',
                'Delivery timelines are estimated at the time of order and may vary depending on location, product availability, and logistics conditions',
                'Delivery charges, if applicable, will be communicated before order confirmation',
                'Installation and commissioning services are included for major equipment items unless stated otherwise',
                'Risk of loss or damage passes to the customer upon delivery and acceptance of goods',
                'You must inspect goods upon delivery. Any visible damage must be reported to the delivery team immediately and noted on the delivery note',
                'Medithrex is not liable for delays caused by circumstances beyond our control, including adverse weather, road conditions, or strikes',
              ]}/>
              <P>For deliveries to remote counties, additional lead times may apply. Our sales team will advise you of expected delivery windows when processing your order.</P>
            </Section>

            <Section id="warranty" title="7. Warranty & Guarantee">
              <P>All products supplied by Medithrex come with:</P>
              <Ul items={[
                'Manufacturer warranty as specified per product (typically 12–24 months)',
                'Genuine, certified equipment from reputable manufacturers',
                'Warranty claims must be submitted in writing to info@medithrex.co.ke within the warranty period',
                'Warranty covers manufacturing defects and component failures under normal use',
                'Warranty does not cover damage caused by misuse, negligence, improper installation by third parties, or failure to follow maintenance guidelines',
                'Warranty support includes on-site engineer visits, spare parts supply, and replacement of defective units',
              ]}/>
              <P>Medithrex acts as an authorised reseller and will facilitate all warranty claims with the original manufacturer on your behalf.</P>
            </Section>

            <Section id="intellectual" title="8. Intellectual Property">
              <P>All content on the Medithrex website — including text, images, logos, product descriptions, and the website design — is the intellectual property of Medithrex Medical Solutions or its content licensors and is protected under Kenyan copyright law.</P>
              <Ul items={[
                'You may not reproduce, distribute, modify or create derivative works from our content without written permission',
                'Product images and specifications are provided by manufacturers for reference purposes only',
                'The MEDITHREX name, logo and branding are trademarks of Medithrex Medical Solutions',
                'You may share links to our website for informational purposes',
              ]}/>
            </Section>

            <Section id="liability" title="9. Limitation of Liability">
              <P>To the maximum extent permitted by Kenyan law, Medithrex shall not be liable for:</P>
              <Ul items={[
                'Indirect, incidental or consequential damages arising from the use or inability to use our products or services',
                'Loss of profits, revenue or data arising from equipment downtime or failure',
                'Damages resulting from misuse, improper installation, or failure to follow manufacturer guidelines',
                'Technical issues beyond our reasonable control including internet outages, server downtime, or payment processing delays',
              ]}/>
              <P>Our total liability to you for any claim arising from these terms shall not exceed the amount paid by you for the specific goods or services giving rise to the claim. Nothing in these terms limits liability for death, personal injury caused by negligence, or fraud.</P>
            </Section>

            <Section id="prohibited" title="10. Prohibited Conduct">
              <P>When using the Medithrex platform, you agree not to:</P>
              <Ul items={[
                'Provide false, misleading or fraudulent information in any order, quote or account registration',
                'Attempt to circumvent or hack our security systems or database',
                'Use our platform to engage in any activity that violates Kenyan law',
                'Resell or redistribute Medithrex products without prior written authorisation',
                'Post false reviews or misrepresent your experience with our products or services',
                'Use automated tools (bots, scrapers) to access or collect data from our website',
              ]}/>
              <P>Violation of these prohibitions may result in immediate account termination and, where appropriate, referral to law enforcement authorities.</P>
            </Section>

            <Section id="governing" title="11. Governing Law">
              <P>These Terms of Service are governed by and construed in accordance with the laws of the <strong>Republic of Kenya</strong>, including but not limited to:</P>
              <Ul items={[
                'The Consumer Protection Act, 2012',
                'The Electronic Transactions Act, 2023',
                'The Kenya Data Protection Act, 2019',
                'The Sale of Goods Act (Cap 31)',
                'The Companies Act, 2015',
              ]}/>
              <P>Any dispute arising out of or in connection with these terms shall first be referred to good-faith negotiation between the parties. If unresolved within 30 days, disputes shall be submitted to the jurisdiction of the <strong>courts of Nairobi, Kenya</strong>. Both parties agree to exhaust alternative dispute resolution mechanisms before initiating court proceedings.</P>
            </Section>

            <Section id="changes" title="12. Changes to Terms">
              <P>Medithrex reserves the right to update these Terms of Service at any time. When we make material changes, we will:</P>
              <Ul items={[
                'Update the "Last updated" date at the top of this page',
                'Notify registered users by email at least 14 days before changes take effect',
                'Display a prominent notice on our website',
              ]}/>
              <P>Your continued use of our services after the effective date of revised terms constitutes your acceptance of those changes. If you do not agree to the new terms, you must stop using our services and may request account deletion.</P>
            </Section>

            <Section id="contact" title="13. Contact Us">
              <P>For any questions, complaints or legal notices regarding these Terms of Service, please contact:</P>
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

            <div style={{ display: 'flex', gap: 12, paddingTop: 24, borderTop: '1px solid var(--white-200)', flexWrap: 'wrap' }}>
              <Link to="/privacy" className="btn btn-outline btn-sm">← Privacy Policy</Link>
              <Link to="/returns" className="btn btn-outline btn-sm">Returns Policy →</Link>
              <Link to="/contact" className="btn btn-dark btn-sm">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
