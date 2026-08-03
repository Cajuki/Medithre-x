import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, ChevronRight, ImagePlus, Microscope, Package, Syringe, Stethoscope, Heart } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import { resolveAssetUrl } from '../utils/assets.js';

const CATEGORY_ICONS = {
  'Medical Equipment': <Stethoscope size={34} />,
  'Laboratory Equipment': <Microscope size={34} />,
  'Surgical Instruments': <Syringe size={34} />,
  'Diagnostic Kits': <Activity size={34} />,
  'Hospital Furniture': <Heart size={34} />,
  'ICU & Critical Care': <Activity size={34} />,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get('/api/categories')
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Seo title="Medical Equipment Categories | Medithrex" description="Explore Medithrex medical equipment categories and find the right products for your healthcare facility." />

      <section className="page-hero pt-28 pb-14 lg:pt-36 lg:pb-20">
        <div className="container-custom page-hero-content">
          <div className="page-hero-breadcrumb"><Link to="/">Home</Link><ChevronRight size={10} /><span>Categories</span></div>
          <h1>Find the right equipment faster</h1>
          <p>Browse our active medical equipment categories, curated for hospitals, clinics, and laboratories.</p>
        </div>
      </section>

      <section className="section section-muted">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <span className="section-eyebrow">Explore the catalogue</span>
            <h2 className="section-title">Equipment categories</h2>
            <p className="section-subtitle">Every category below is loaded from the live catalogue, so the list stays in sync with the products available on the site.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, index) => <div key={index} className="aspect-[1.35] rounded-2xl skeleton" />)}
            </div>
          ) : error ? (
            <div className="premium-card p-10 text-center">
              <p className="text-charcoal-600 mb-4">Categories are temporarily unavailable.</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>
            </div>
          ) : categories.length === 0 ? (
            <div className="premium-card p-12 text-center">
              <ImagePlus size={34} className="mx-auto mb-4 text-charcoal-200" />
              <p className="text-charcoal-400">No active categories have been published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((category, index) => (
                <motion.div key={category.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="group block h-full overflow-hidden rounded-2xl border border-border bg-white shadow-sm hover:-translate-y-1 hover:border-primary-100 hover:shadow-lg transition-all">
                    <div className="relative aspect-[1.5] overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
                      {category.image_url ? (
                        <img src={resolveAssetUrl(category.image_url)} alt={category.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-primary/50">{CATEGORY_ICONS[category.name] || <Package size={34} />}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-bold text-charcoal group-hover:text-primary transition-colors">{category.name}</h3>
                        <ChevronRight size={18} className="mt-0.5 shrink-0 text-secondary transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="mt-2 min-h-10 text-sm leading-relaxed text-charcoal-400">{category.description || 'Explore equipment and supplies in this category.'}</p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">{Number(category.product_count || 0)} products</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
