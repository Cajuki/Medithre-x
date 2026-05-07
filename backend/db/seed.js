/**
 * Medithrex — PostgreSQL Seed Script
 * Run: npm run db:seed
 *
 * Inserts 2 demo users + 12 demo products.
 * Skips rows that already exist (ON CONFLICT DO NOTHING).
 */

import bcrypt from 'bcryptjs';
import { query } from './pool.js';

// ── USERS ────────────────────────────────────────────────────────────────────
const seedUsers = async () => {
  console.log('👤 Seeding users...');

  const adminHash = await bcrypt.hash('Admin@2024', 10);
  const userHash  = await bcrypt.hash('User@2024', 10);

  await query(`
    INSERT INTO users (name, email, phone, company, password, role)
    VALUES
      ('Admin Medithrex', 'admin@medithrex.co.ke', '0790080903', 'Medithrex Medical Solutions', $1, 'admin'),
      ('Jane Wanjiru',    'jane@hospital.co.ke',   '0712345678', 'Kenyatta National Hospital',  $2, 'user')
    ON CONFLICT (email) DO NOTHING;
  `, [adminHash, userHash]);

  console.log('  ✅ admin@medithrex.co.ke  /  Admin@2024');
  console.log('  ✅ jane@hospital.co.ke    /  User@2024');
};

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: 'Digital X-Ray System DR-3000', sku: 'MTX-IMG-001',
    description: 'High-resolution digital radiography system with advanced image processing, wireless detector, and DICOM compatibility. Ideal for hospitals and diagnostic centers.',
    short_description: 'Advanced DR system with wireless detector',
    category: 'Imaging Equipment', price: 2850000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600'],
    brand: 'Philips', origin: 'Netherlands', in_stock: true, featured: true,
    tags: ['xray','imaging','diagnostic'],
    specifications: [{ key:'Detector Size', value:'43x43 cm' },{ key:'Resolution', value:'3.1 lp/mm' },{ key:'Power', value:'380V/50Hz' }]
  },
  {
    name: 'Automated Hematology Analyzer BC-6800', sku: 'MTX-LAB-001',
    description: 'Full 5-part differential hematology analyzer with 60 samples/hour throughput. Features advanced algorithms for reliable CBC with differential results.',
    short_description: '5-part differential, 60 samples/hour',
    category: 'Laboratory Equipment', price: 485000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600'],
    brand: 'Mindray', origin: 'China', in_stock: true, featured: true,
    tags: ['hematology','CBC','blood count'],
    specifications: [{ key:'Throughput', value:'60 samples/hr' },{ key:'Parameters', value:'29 parameters' },{ key:'Sample Volume', value:'9.9µL' }]
  },
  {
    name: 'ICU Patient Monitor PM-9000', sku: 'MTX-MON-001',
    description: 'Comprehensive bedside monitor for ICU and critical care. Monitors ECG, SpO2, NIBP, temperature, and CO2 with 15" touchscreen display.',
    short_description: 'Multi-parameter ICU monitor, 15" touch',
    category: 'Patient Monitoring', price: 320000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600'],
    brand: 'GE Healthcare', origin: 'USA', in_stock: true, featured: true,
    tags: ['ICU','monitoring','critical care'],
    specifications: [{ key:'Display', value:'15" color touchscreen' },{ key:'Parameters', value:'ECG, SpO2, NIBP, Temp, CO2' },{ key:'Battery', value:'4 hours backup' }]
  },
  {
    name: 'Laparoscopic Surgery Tower', sku: 'MTX-SRG-001',
    description: 'Complete HD laparoscopic surgery system including 10mm 0° and 30° telescopes, full HD camera, LED light source, insufflator, and 27" HD monitor.',
    short_description: 'Complete HD laparoscopy package',
    category: 'Surgical Instruments', price: null, price_on_request: true,
    images: ['https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600'],
    brand: 'Karl Storz', origin: 'Germany', in_stock: true, featured: true,
    tags: ['laparoscopy','surgery','HD'],
    specifications: [{ key:'Camera', value:'Full HD 1080p' },{ key:'Light Source', value:'LED 300W' },{ key:'Monitor', value:'27" HD Medical Grade' }]
  },
  {
    name: 'Ultrasound System DC-70', sku: 'MTX-IMG-002',
    description: 'Premium color Doppler ultrasound with 21.5" LED monitor. Supports abdominal, cardiac, obstetric, and vascular applications.',
    short_description: 'Premium color Doppler, multi-application',
    category: 'Imaging Equipment', price: 1250000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600'],
    brand: 'Mindray', origin: 'China', in_stock: true, featured: false,
    tags: ['ultrasound','doppler','imaging'],
    specifications: [{ key:'Monitor', value:'21.5" LED' },{ key:'Probes', value:'Convex, Linear, Phased' },{ key:'Storage', value:'500GB HDD' }]
  },
  {
    name: 'Biochemistry Analyzer BS-200E', sku: 'MTX-LAB-002',
    description: 'Fully automated random access biochemistry analyzer. 200 tests per hour with 45-position onboard reagent capacity.',
    short_description: 'Fully automated, 200 tests/hour',
    category: 'Laboratory Equipment', price: 680000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600'],
    brand: 'Mindray', origin: 'China', in_stock: true, featured: false,
    tags: ['biochemistry','clinical chemistry','analyzer'],
    specifications: [{ key:'Throughput', value:'200 tests/hr' },{ key:'Sample Types', value:'Serum, plasma, urine' },{ key:'Reagent Positions', value:'45 onboard' }]
  },
  {
    name: 'Defibrillator BeneHeart D6', sku: 'MTX-MON-002',
    description: 'Biphasic defibrillator with AED, pacing, and monitoring functions. Large 7.5" display, rechargeable battery.',
    short_description: 'Biphasic defib with AED & pacing',
    category: 'Patient Monitoring', price: 185000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600'],
    brand: 'Mindray', origin: 'China', in_stock: true, featured: false,
    tags: ['defibrillator','AED','cardiac'],
    specifications: [{ key:'Energy', value:'1-360 Joules' },{ key:'Display', value:'7.5" color LCD' },{ key:'Battery', value:'3 hours operation' }]
  },
  {
    name: 'Dental Unit CEFLA C-PLEX', sku: 'MTX-DEN-001',
    description: 'Modern dental treatment unit with LED operating light, integrated scaler, air rotor, micromotor, and three-way syringe.',
    short_description: 'Full dental unit with LED light',
    category: 'Dental Equipment', price: 420000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1609207807107-e8e3fb78f4d3?w=600'],
    brand: 'CEFLA', origin: 'Italy', in_stock: false, featured: false,
    tags: ['dental','dentistry','treatment unit'],
    specifications: [{ key:'Light', value:'LED 30,000 lux' },{ key:'Chair', value:'Electric 4-movement' },{ key:'Water Bottle', value:'750ml' }]
  },
  {
    name: 'Surgical Suction Unit', sku: 'MTX-SRG-002',
    description: 'High-performance surgical suction machine for operating theatres and ICUs. Dual jar system, adjustable vacuum, portable design.',
    short_description: 'Dual jar, high-performance suction',
    category: 'Surgical Instruments', price: 45000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600'],
    brand: 'Medela', origin: 'Switzerland', in_stock: true, featured: false,
    tags: ['suction','surgical','theatre'],
    specifications: [{ key:'Vacuum', value:'-0.08 MPa max' },{ key:'Jar Capacity', value:'2x 1000ml' },{ key:'Noise Level', value:'<60dB' }]
  },
  {
    name: 'PCR Thermocycler GeneAmp 9700', sku: 'MTX-LAB-003',
    description: 'Fast and reliable PCR thermocycler with 96-well block, gradient function, and PC connectivity for molecular diagnostics.',
    short_description: '96-well PCR with gradient & PC link',
    category: 'Laboratory Equipment', price: null, price_on_request: true,
    images: ['https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600'],
    brand: 'Applied Biosystems', origin: 'USA', in_stock: true, featured: false,
    tags: ['PCR','molecular','diagnostics'],
    specifications: [{ key:'Well Plate', value:'96-well standard' },{ key:'Ramp Rate', value:'3.3°C/sec' },{ key:'Temp Range', value:'0-100°C' }]
  },
  {
    name: 'Hospital Bed with Mattress', sku: 'MTX-GEN-001',
    description: 'Electric 3-function hospital bed with ABS side rails, central locking castors, IV pole socket, and premium anti-decubitus mattress.',
    short_description: 'Electric 3-function bed + mattress',
    category: 'Rehabilitation Equipment', price: 95000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600'],
    brand: 'Linet', origin: 'Czech Republic', in_stock: true, featured: false,
    tags: ['hospital bed','ward','electric'],
    specifications: [{ key:'Functions', value:'3 electric motors' },{ key:'Load Capacity', value:'250kg' },{ key:'Dimensions', value:'2100x900mm' }]
  },
  {
    name: 'Autoclave Steam Sterilizer 23L', sku: 'MTX-CON-001',
    description: 'Benchtop pre-vacuum autoclave for sterilizing wrapped and unwrapped instruments. 23-liter chamber, multiple sterilization cycles.',
    short_description: 'Pre-vacuum benchtop autoclave, 23L',
    category: 'Consumables & Supplies', price: 75000, price_on_request: false,
    images: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600'],
    brand: 'Tuttnauer', origin: 'Israel', in_stock: true, featured: false,
    tags: ['autoclave','sterilizer','infection control'],
    specifications: [{ key:'Chamber Volume', value:'23 Liters' },{ key:'Temperature', value:'121/134°C' },{ key:'Cycles', value:'3 standard + custom' }]
  }
];

const seedProducts = async () => {
  console.log('\n📦 Seeding products...');
  for (const p of PRODUCTS) {
    await query(`
      INSERT INTO products
        (name, sku, description, short_description, category, price, price_on_request,
         images, brand, origin, in_stock, featured, tags, specifications)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (sku) DO NOTHING;
    `, [
      p.name, p.sku, p.description, p.short_description, p.category,
      p.price, p.price_on_request, p.images, p.brand, p.origin,
      p.in_stock, p.featured, p.tags, JSON.stringify(p.specifications)
    ]);
    console.log(`  ✅ ${p.name}`);
  }
};

// ── RUN ──────────────────────────────────────────────────────────────────────
const seed = async () => {
  console.log('🌱 Medithrex Database Seeder\n');
  try {
    await seedUsers();
    await seedProducts();
    console.log('\n🎉 Seeding complete!\n');
    console.log('  Admin → admin@medithrex.co.ke  /  Admin@2024');
    console.log('  User  → jane@hospital.co.ke    /  User@2024\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
