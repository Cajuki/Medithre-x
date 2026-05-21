import { Link } from 'react-router-dom';
import { RotateCcw, ChevronRight, AlertTriangle, CheckCircle, XCircle, Phone, Mail, Clock } from 'lucide-react';

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
  { id: 'overview',     label: 'Policy Overview' },
  { id: 'eligibility',  label: 'Return Eligibility' },
  { id: 'condition',    label: 'Condition of Returned Goods' },
  { id: 'damages',      label: 'Damages & Customer Liability' },
  { id: 'process',      label: 'How to Initiate a Return' },
  { id: 'refunds',      label: 'Refunds & Replacements' },
  { id: 'non-returnable', label: 'Non-Returnable Items' },
  { id: 'warranty',     label: 'Warranty Returns' },
  { id: 'contact',      label: 'Contact Us' },
];

export default function ReturnsPage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'var(--black)', padding: '52px 0 44px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%', background: 'linear-gradient(135deg, transparent 40%, rgba(245,195,0,0.04))', pointerEvents: 'none' }}/>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={12}/>
            <span style={{ color: 'var(--yellow)' }}>Returns Policy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, background: 'var(--yellow)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <RotateCcw size={24} color="var(--black)"/>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 900, color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Returns Policy</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', maxWidth: 580 }}>
            We want you to be completely satisfied with every purchase. If something isn't right, we're here to make it right — fairly and promptly.
          </p>
          <div style={{ marginTop: 16, display: 'inline-block', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 16px', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
            Last updated: {LAST_UPDATED}
          </div>
        </div>
      </div>

      {/* 24hr urgent banner */}
      <div style={{ background: 'var(--yellow)', padding: '18px 0', borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={20} color="var(--black)"/>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 900, color: 'var(--black)' }}>24-HOUR RETURN WINDOW</span>
            </div>
            <span style={{ color: 'rgba(0,0,0,0.6)', fontSize: '0.875rem' }}>Return requests must be submitted within 24 hours of delivery. Contact us immediately on <a href="tel:0790080903" style={{ color: 'var(--black)', fontWeight: 700, textDecoration: 'none' }}>0790 080 903</a></span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '52px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 52, alignItems: 'start' }}>

          {/* TOC */}
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
            {/* Quick contact */}
            <div style={{ margin: '8px 12px 12px', background: 'var(--black)', borderRadius: 8, padding: '14px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--yellow)', marginBottom: 8 }}>Need to Return?</div>
              <a href="tel:0790080903" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8125rem', color: 'var(--white)', textDecoration: 'none', marginBottom: 6 }}><Phone size={13} color="var(--yellow)"/> 0790 080 903</a>
              <a href="mailto:info@medithrex.co.ke" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8125rem', color: 'var(--white)', textDecoration: 'none' }}><Mail size={13} color="var(--yellow)"/> info@medithrex.co.ke</a>
            </div>
          </nav>

          {/* Content */}
          <div>
            <Section id="overview" title="1. Policy Overview">
              <P>At Medithrex Medical Solutions, we are committed to supplying high-quality, certified medical and laboratory equipment. We understand that occasionally a return may be necessary, and we are committed to handling all return requests fairly and efficiently.</P>
              <P><strong>We accept returns.</strong> However, to protect both our customers and the integrity of medical equipment in the healthcare supply chain, all returns must comply strictly with the conditions set out in this policy.</P>

              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, margin: '24px 0' }}>
                {[
                  { icon: <Clock size={22}/>, title: '24 Hours', desc: 'Return window from delivery', color: '#FEF3C7', border: 'rgba(245,195,0,0.3)', iconColor: 'var(--yellow-600)' },
                  { icon: <CheckCircle size={22}/>, title: 'Good Condition', desc: 'Goods must be undamaged & unused', color: 'var(--green-light)', border: 'rgba(5,150,105,0.2)', iconColor: 'var(--green)' },
                  { icon: <RotateCcw size={22}/>, title: 'Returns Accepted', desc: 'Eligible items accepted for return', color: '#DBEAFE', border: 'rgba(37,99,235,0.2)', iconColor: '#2563EB' },
                ].map(card => (
                  <div key={card.title} style={{ background: card.color, border: `1px solid ${card.border}`, borderRadius: 'var(--radius-md)', padding: '18px 16px' }}>
                    <div style={{ color: card.iconColor, marginBottom: 8 }}>{card.icon}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: 'var(--black)', marginBottom: 4 }}>{card.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--grey-600)' }}>{card.desc}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="eligibility" title="2. Return Eligibility">
              <P>A return request will be considered eligible under the following circumstances:</P>
              <Ul items={[
                'The item delivered is different from what was ordered (wrong product, wrong model, wrong specification)',
                'The item arrives with a manufacturing defect that was not caused during transit or by the customer',
                'The item was damaged during delivery — this must be noted on the delivery note at the time of receipt',
                'A duplicate order was placed and delivered in error',
                'The item does not match the agreed specification in a signed quotation or purchase order',
              ]}/>

              {/* Critical notice */}
              <div style={{ background: 'var(--yellow)', borderRadius: 'var(--radius-md)', padding: '16px 20px', margin: '20px 0', display: 'flex', gap: 14 }}>
                <AlertTriangle size={22} style={{ flexShrink: 0, marginTop: 2 }} color="var(--black)"/>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--black)', marginBottom: 4 }}>IMPORTANT — 24-HOUR RETURN WINDOW</div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
                    All return requests <strong>must be submitted within 24 hours</strong> of delivery. After this window, we are unable to process return requests except for valid warranty claims. Contact us on <strong>0790 080 903</strong> immediately if you have a concern.
                  </div>
                </div>
              </div>
            </Section>

            <Section id="condition" title="3. Condition of Returned Goods">
              <P>Medithrex will only accept returned goods that meet the following condition requirements. This policy exists to maintain the safety and integrity of medical equipment re-entering the supply chain.</P>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: '20px 0' }}>
                {/* Acceptable */}
                <div style={{ background: 'var(--green-light)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 'var(--radius-md)', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <CheckCircle size={18} color="var(--green)"/>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--green)' }}>ACCEPTABLE</span>
                  </div>
                  {['In original manufacturer packaging','Unused and in original sealed condition','All accessories, manuals and components included','No scratches, dents or physical damage','Protective wrapping and seals intact','Unit has not been powered on or installed'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 6, fontSize: '0.8125rem', color: '#065f46' }}>
                      <CheckCircle size={13} style={{ flexShrink: 0, marginTop: 2 }}/> {item}
                    </div>
                  ))}
                </div>

                {/* Not Acceptable */}
                <div style={{ background: 'var(--red-light)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-md)', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <XCircle size={18} color="var(--red)"/>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--red)' }}>NOT ACCEPTABLE</span>
                  </div>
                  {['Opened packaging or broken manufacturer seals','Equipment that has been installed or used','Missing accessories, components or manuals','Physical damage caused by the customer','Items modified or tampered with','Equipment showing signs of misuse or neglect'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 6, fontSize: '0.8125rem', color: '#991b1b' }}>
                      <XCircle size={13} style={{ flexShrink: 0, marginTop: 2 }}/> {item}
                    </div>
                  ))}
                </div>
              </div>

              <P>All returned items will be inspected by our technical team upon receipt at our Nairobi CBD warehouse. Items that do not meet the above conditions will be returned to the customer at their cost.</P>
            </Section>

            <Section id="damages" title="4. Damages & Customer Liability">
              <div style={{ background: '#FEF2F2', border: '1.5px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius-md)', padding: '20px 22px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <AlertTriangle size={22} color="var(--red)" style={{ flexShrink: 0 }}/>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--red)', marginBottom: 6 }}>Customer Liability for Damaged Returns</div>
                    <div style={{ fontSize: '0.9rem', color: '#7f1d1d', lineHeight: 1.7 }}>
                      If returned goods arrive at our facility in a condition worse than when they were delivered to you — whether due to improper repacking, physical mishandling, or damage that occurred while the goods were in your possession — <strong>you will be held fully responsible for the cost of those damages.</strong>
                    </div>
                  </div>
                </div>
              </div>

              <P>Specifically, the following apply in cases of customer-caused damage:</P>
              <Ul items={[
                'Medithrex will conduct a full technical inspection of all returned goods within 2 business days of receipt',
                'A detailed damage assessment report will be prepared and shared with you',
                'You will receive an invoice for the repair, replacement or depreciation cost of the damage caused',
                'This invoice must be settled within 14 days. Unpaid damage invoices will accrue interest at 2% per month',
                'Where damage is irreparable, you will be charged the full replacement value of the equipment',
                'Medithrex reserves the right to withhold your refund or replacement until the damage cost has been settled',
              ]}/>
              <P>To avoid damage disputes, we strongly recommend photographing the equipment before repacking and using adequate cushioning when returning goods. Use the original packaging where possible. If you have any doubts, call us before returning — we can advise on safe packaging.</P>
            </Section>

            <Section id="process" title="5. How to Initiate a Return">
              <P>Follow these steps to initiate a return within the 24-hour window:</P>

              {[
                { step: '01', title: 'Contact Us Immediately', desc: 'Call 0790 080 903 or email info@medithrex.co.ke within 24 hours of delivery. Provide your order number, a description of the issue, and clear photos of the item and its condition.' },
                { step: '02', title: 'Receive Return Authorisation', desc: 'Our team will review your request and issue a Return Merchandise Authorisation (RMA) number within 4 hours during business hours. Do not return goods without an RMA number.' },
                { step: '03', title: 'Prepare the Package', desc: 'Pack the item securely in its original packaging. Include all accessories, manuals and components. Clearly write the RMA number on the outside of the package. Photograph the packed item before sealing.' },
                { step: '04', title: 'Arrange Collection or Drop-Off', desc: 'For large equipment, we will arrange collection at our cost if the return is approved and our fault. For smaller items, you may drop off at Pramukh Plaza — Shop 19, Nairobi CBD, or use a reputable courier at your cost.' },
                { step: '05', title: 'Inspection & Resolution', desc: 'We will inspect the returned goods within 2 business days. You will receive a written outcome — either a full refund, replacement, or repair — within 5 business days of receipt.' },
              ].map(step => (
                <div key={step.step} style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, background: 'var(--black)', color: 'var(--yellow)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '0.9rem', flexShrink: 0 }}>{step.step}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--black)', marginBottom: 5 }}>{step.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--grey-600)', lineHeight: 1.7 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </Section>

            <Section id="refunds" title="6. Refunds & Replacements">
              <P>Once a return is approved and the item passes inspection, we will offer one of the following resolutions depending on the nature of the issue:</P>

              {[
                { title: 'Full Refund', desc: 'Issued for items that are defective, wrong products, or items damaged by us in transit. Refunds are processed via the original payment method within 7 business days of approval.', highlight: true },
                { title: 'Replacement', desc: 'A replacement unit of the same model will be dispatched within 3 business days of the approved return being received at our warehouse. Replacement delivery follows standard delivery timelines.', highlight: false },
                { title: 'Repair', desc: 'For items with minor manufacturer defects that can be rectified, we will carry out repair or arrange manufacturer repair under warranty at no cost to you.', highlight: false },
              ].map(opt => (
                <div key={opt.title} style={{ background: opt.highlight ? '#FEF9C3' : 'var(--white-50)', border: `1px solid ${opt.highlight ? 'rgba(245,195,0,0.4)' : 'var(--white-200)'}`, borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--black)', marginBottom: 6 }}>{opt.title}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--grey-600)', lineHeight: 1.7 }}>{opt.desc}</div>
                </div>
              ))}

              <P>M-Pesa refunds will be sent to the phone number used for payment. Bank transfer refunds will be made to the account from which payment was received. We do not issue cash refunds under any circumstances.</P>
            </Section>

            <Section id="non-returnable" title="7. Non-Returnable Items">
              <P>The following items cannot be returned under any circumstances due to health, safety and hygiene regulations applicable to medical supplies in Kenya:</P>
              <Ul items={[
                'Consumables that have been opened, including gloves, syringes, specimen containers, reagents and test kits',
                'Equipment that has been used on patients or in a clinical procedure',
                'Custom-ordered or specially imported equipment ordered to your specific requirements',
                'Software licences and digital subscriptions',
                'Items explicitly marked "Non-Returnable" on the product listing or invoice',
                'Hazardous materials including certain chemical reagents and biological substances',
              ]}/>
              <P>If you are unsure whether an item is returnable before purchasing, please contact our sales team for clarification.</P>
            </Section>

            <Section id="warranty" title="8. Warranty Returns">
              <P>Warranty returns are handled separately from standard returns and are not subject to the 24-hour window. Warranty claims:</P>
              <Ul items={[
                'Can be submitted at any time within the manufacturer\'s warranty period (typically 12–24 months)',
                'Must be submitted in writing to info@medithrex.co.ke with proof of purchase and a description of the defect',
                'Will be assessed by our technical team within 5 business days',
                'May involve on-site inspection before a return is authorised',
                'Are resolved through repair, replacement or credit note at Medithrex\'s discretion',
              ]}/>
              <P>Warranty does not cover damage caused by misuse, negligence, improper installation by third parties, power surges, or failure to follow the manufacturer\'s maintenance schedule.</P>
            </Section>

            <Section id="contact" title="9. Contact Us">
              <P>For all returns, complaints or questions about this policy, contact our customer support team:</P>
              <div style={{ background: 'var(--black)', borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginTop: 8, marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--white)', marginBottom: 16 }}>Medithrex Medical Solutions — Returns Team</div>
                {[
                  ['Phone',    '0790 080 903 (Call or WhatsApp)'],
                  ['Email',    'info@medithrex.co.ke'],
                  ['Address',  'Pramukh Plaza — Shop 19, Nairobi CBD, Nairobi, Kenya'],
                  ['Hours',    'Mon – Fri: 8:00 AM – 6:00 PM | Sat: 9:00 AM – 2:00 PM EAT'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', minWidth: 60, paddingTop: 2 }}>{l}</span>
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="tel:0790080903" className="btn btn-primary"><Phone size={16}/> Call Now</a>
                <a href="mailto:info@medithrex.co.ke" className="btn btn-dark"><Mail size={16}/> Email Returns Team</a>
                <a href={`https://wa.me/254790080903?text=Hello%20Medithrex%2C%20I%20want%20to%20initiate%20a%20return%20for%20order%20number%3A`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ background: '#25D366', color: 'var(--white)', borderColor: '#25D366' }}>WhatsApp Us</a>
              </div>
            </Section>

            <div style={{ display: 'flex', gap: 12, paddingTop: 24, borderTop: '1px solid var(--white-200)', flexWrap: 'wrap' }}>
              <Link to="/privacy" className="btn btn-outline btn-sm">← Privacy Policy</Link>
              <Link to="/terms"   className="btn btn-outline btn-sm">← Terms of Service</Link>
              <Link to="/contact" className="btn btn-dark btn-sm">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
