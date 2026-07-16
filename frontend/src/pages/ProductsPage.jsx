import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';
import {
  Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown,
  Filter, ArrowUpDown, Loader2, Package, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const searchTimeout = useRef(null);

  const limit = 12;

  useEffect(() => {
    axios.get('/api/categories')
      .then(r => setCategories(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, sort, selectedCategory, searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      params.set('page', page.toString());
      params.set('sort', sort);

      const cat = selectedCategory || searchParams.get('category');
      if (cat) params.set('category', cat);

      const search = searchTerm || searchParams.get('search');
      if (search) params.set('search', search);

      if (priceRange.min) params.set('min_price', priceRange.min);
      if (priceRange.max) params.set('max_price', priceRange.max);

      const { data } = await axios.get(`/api/products?${params.toString()}`);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalProducts(data.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      const params = new URLSearchParams(searchParams);
      if (value) params.set('search', value);
      else params.delete('search');
      setSearchParams(params);
    }, 400);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat);
    else params.delete('category');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory || searchTerm || priceRange.min || priceRange.max;

  return (
    <div className="min-h-screen">
      <Seo title="Medical Equipment & Supplies | Medithrex" description="Browse our comprehensive catalog of medical equipment, laboratory supplies, surgical instruments, and healthcare products." />

      {/* ── Page Hero ──────────────────────────────────────────────────── */}
      <section className="page-hero pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="container-custom page-hero-content">
          <div className="page-hero-breadcrumb">
            <Link to="/">Home</Link> <ChevronRight size={10} /> <span>Products</span>
          </div>
          <h1>Medical Equipment & Supplies</h1>
          <p>Browse {totalProducts > 0 ? `${totalProducts}+` : ''} products across all categories</p>
        </div>
      </section>

      {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
      <div className="sticky top-[73px] lg:top-[81px] z-40 bg-white/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container-custom py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="text"
                placeholder="Search products, brands, SKUs..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-section border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
              />
              {searchTerm && (
                <button onClick={() => handleSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal">
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                filtersOpen || hasActiveFilters
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-charcoal-600 border-border hover:border-primary hover:text-primary'
              }`}
            >
              <Filter size={15} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-secondary" />}
            </button>

            <div className="hidden sm:flex items-center gap-1 border-l border-border pl-3">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-charcoal-400 hover:text-charcoal hover:bg-section'}`}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-charcoal-400 hover:text-charcoal hover:bg-section'}`}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="appearance-none bg-white border border-border rounded-lg pl-3 pr-8 py-2.5 text-sm text-charcoal-600 font-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A-Z</option>
                <option value="name_desc">Name: Z-A</option>
                <option value="popular">Most Popular</option>
              </select>
              <ArrowUpDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border bg-section"
            >
              <div className="container-custom py-4">
                <div className="flex flex-wrap items-end gap-4">
                  {/* Categories */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="form-label">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      className="form-select"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="form-label">Price Range (KSh)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="form-input"
                      />
                      <span className="text-charcoal-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => { setPage(1); fetchProducts(); }} className="btn btn-primary btn-sm">
                      Apply Filters
                    </button>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="btn btn-ghost btn-sm text-danger">
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Products Grid ───────────────────────────────────────────────── */}
      <section className="section pt-8">
        <div className="container-custom">
          {/* Results Count */}
          {!loading && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-charcoal-400">
                Showing <span className="font-semibold text-charcoal">{products.length}</span> of{' '}
                <span className="font-semibold text-charcoal">{totalProducts}</span> products
              </p>
              {selectedCategory && (
                <button onClick={() => handleCategorySelect('')} className="flex items-center gap-1 text-xs text-primary hover:text-primary-700">
                  <X size={12} /> Clear category
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className={viewMode === 'grid' ? 'products-grid' : 'space-y-4'}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border border-border overflow-hidden">
                  <div className={viewMode === 'grid' ? 'aspect-square skeleton' : 'h-32 skeleton'} />
                  {viewMode === 'grid' && (
                    <div className="p-4 space-y-3">
                      <div className="h-3 skeleton w-1/3" />
                      <div className="h-4 skeleton w-3/4" />
                      <div className="h-3 skeleton w-1/2" />
                      <div className="h-8 skeleton w-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-section flex items-center justify-center mb-6">
                <Package size={36} className="text-charcoal-400" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-2">No products found</h3>
              <p className="text-charcoal-400 text-sm mb-6 max-w-md mx-auto">
                We couldn't find any products matching your search. Try adjusting your filters or browse our categories.
              </p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={viewMode === 'grid' ? 'products-grid' : 'space-y-4'}
            >
              {products.map(product => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-lg border border-border text-charcoal-600 hover:bg-section hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[40px] h-10 rounded-lg text-sm font-semibold transition-all ${
                    p === page
                      ? 'bg-primary text-white shadow-md'
                      : 'border border-border text-charcoal-600 hover:bg-section hover:border-primary'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-lg border border-border text-charcoal-600 hover:bg-section hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}