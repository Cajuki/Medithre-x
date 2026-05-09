import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import './ProductsPage.css';

const PRICE_RANGES = [
  { label: 'Any Price',        min: null,   max: null    },
  { label: 'Under KES 50K',   min: null,   max: 50000   },
  { label: 'KES 50K – 200K',  min: 50000,  max: 200000  },
  { label: 'KES 200K – 500K', min: 200000, max: 500000  },
  { label: 'KES 500K – 1M',   min: 500000, max: 1000000 },
  { label: 'Over KES 1M',     min: 1000000, max: null   },
];

const SORT_OPTIONS = [
  { label: 'Default (Featured)',   value: '' },
  { label: 'Name A – Z',          value: 'name_asc' },
  { label: 'Price: Low to High',  value: 'price_asc' },
  { label: 'Price: High to Low',  value: 'price_desc' },
  { label: 'Newest First',        value: 'newest' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven filters
  const category = searchParams.get('category') || '';
  const search   = searchParams.get('search')   || '';
  const inStock  = searchParams.get('inStock')  || '';
  const page     = parseInt(searchParams.get('page') || '1');

  // Local UI state
  const [searchInput, setSearchInput] = useState(search);
  const [priceRange,  setPriceRange]  = useState(PRICE_RANGES[0]);
  const [sortBy,      setSortBy]      = useState('');
  const [featured,    setFeatured]    = useState(false);

  // Filter panel
  const [panelOpen,       setPanelOpen]       = useState(false);
  const [catExpanded,     setCatExpanded]      = useState(true);
  const [priceExpanded,   setPriceExpanded]    = useState(true);
  const [stockExpanded,   setStockExpanded]    = useState(true);
  const [sortExpanded,    setSortExpanded]     = useState(true);
  const filterRef = useRef(null);

  // Data
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('/api/categories')
      .then(r => setCategories((r.data || []).map(c => c.name)))
      .catch(() => setCategories([]));
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    if (panelOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [panelOpen]);

  // Fetch products whenever filters change
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category)              params.set('category', category);
    if (search)                params.set('search',   search);
    if (inStock === 'true')    params.set('inStock',  'true');
    if (featured)              params.set('featured', 'true');
    params.set('page',  page);
    params.set('limit', 12);

    axios.get(`/api/products?${params}`)
      .then(r => {
        let prods = r.data.products || [];

        // Client-side price filter (backend doesn't have this yet)
        if (priceRange.min !== null) prods = prods.filter(p => !p.price || p.price >= priceRange.min);
        if (priceRange.max !== null) prods = prods.filter(p => !p.price || p.price <= priceRange.max);

        // Client-side sort
        if (sortBy === 'name_asc')   prods = [...prods].sort((a,b) => a.name.localeCompare(b.name));
        if (sortBy === 'price_asc')  prods = [...prods].sort((a,b) => (a.price||0) - (b.price||0));
        if (sortBy === 'price_desc') prods = [...prods].sort((a,b) => (b.price||0) - (a.price||0));
        if (sortBy === 'newest')     prods = [...prods].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

        setProducts(prods);
        setTotal(r.data.total || 0);
        setPages(r.data.pages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, search, inStock, featured, page, priceRange, sortBy]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setParam('search', searchInput.trim());
    setPanelOpen(false);
  };

  const clearAll = () => {
    setSearchInput('');
    setPriceRange(PRICE_RANGES[0]);
    setSortBy('');
    setFeatured(false);
    setSearchParams({});
  };

  const activeFilterCount = [
    category, search, inStock === 'true',
    priceRange.min !== null || priceRange.max !== null,
    sortBy, featured,
  ].filter(Boolean).length;

  // Section toggle helper
  const Section = ({ label, expanded, toggle, children }) => (
    <div className="filter-section">
      <button className="filter-section-head" onClick={toggle}>
        <span>{label}</span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {expanded && <div className="filter-section-body">{children}</div>}
    </div>
  );

  return (
    <div className="products-page">
      {/* Page hero */}
      <div className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">Medithrex Product Catalogue</p>
          <h1>Medical & Laboratory Equipment</h1>
          <p>Browse our extensive range of quality-certified medical and laboratory equipment for healthcare institutions across Kenya.</p>
        </div>
      </div>

      <div className="container products-page-body">
        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="products-toolbar-bar">
          <form onSubmit={handleSearch} className="search-form-bar">
            <Search size={17} className="search-bar-icon" />
            <input
              type="text"
              placeholder="Search equipment, brand, category…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="search-bar-input"
            />
            {searchInput && (
              <button type="button" className="search-bar-clear" onClick={() => { setSearchInput(''); setParam('search', ''); }}>
                <X size={15} />
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm">Search</button>

            {/* Filter icon button */}
            <div className="filter-btn-wrap" ref={filterRef}>
              <button
                type="button"
                className={`filter-icon-btn${panelOpen ? ' active' : ''}`}
                onClick={() => setPanelOpen(o => !o)}
                title="Filters"
              >
                <SlidersHorizontal size={18} />
                {activeFilterCount > 0 && (
                  <span className="filter-badge">{activeFilterCount}</span>
                )}
              </button>

              {/* ── Filter Panel dropdown ──────────────────────────────── */}
              {panelOpen && (
                <div className="filter-panel">
                  <div className="filter-panel-inner">
                    <div className="filter-panel-header">
                      <span>Filters {activeFilterCount > 0 && <em>({activeFilterCount} active)</em>}</span>
                      <button className="filter-panel-close" onClick={() => setPanelOpen(false)}><X size={16} /></button>
                    </div>

                  {/* Category */}
                  <Section label="Category" expanded={catExpanded} toggle={() => setCatExpanded(o => !o)}>
                    <button
                      className={`fp-cat-btn${!category ? ' active' : ''}`}
                      onClick={() => setParam('category', '')}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        className={`fp-cat-btn${category === cat ? ' active' : ''}`}
                        onClick={() => { setParam('category', cat); }}
                      >
                        {category === cat && <Check size={12} />} {cat}
                      </button>
                    ))}
                  </Section>

                  {/* Price Range */}
                  <Section label="Price Range" expanded={priceExpanded} toggle={() => setPriceExpanded(o => !o)}>
                    {PRICE_RANGES.map(r => (
                      <button
                        key={r.label}
                        className={`fp-cat-btn${priceRange.label === r.label ? ' active' : ''}`}
                        onClick={() => setPriceRange(r)}
                      >
                        {priceRange.label === r.label && <Check size={12} />} {r.label}
                      </button>
                    ))}
                  </Section>

                  {/* Availability */}
                  <Section label="Availability" expanded={stockExpanded} toggle={() => setStockExpanded(o => !o)}>
                    <label className="fp-checkbox">
                      <input type="checkbox" checked={inStock === 'true'} onChange={e => setParam('inStock', e.target.checked ? 'true' : '')} />
                      In Stock Only
                    </label>
                    <label className="fp-checkbox">
                      <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
                      Featured Products
                    </label>
                  </Section>

                  {/* Sort */}
                  <Section label="Sort By" expanded={sortExpanded} toggle={() => setSortExpanded(o => !o)}>
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        className={`fp-cat-btn${sortBy === opt.value ? ' active' : ''}`}
                        onClick={() => setSortBy(opt.value)}
                      >
                        {sortBy === opt.value && <Check size={12} />} {opt.label}
                      </button>
                    ))}
                  </Section>

                  <div className="filter-panel-footer">
                    <button className="btn btn-outline btn-sm" onClick={() => { clearAll(); setPanelOpen(false); }}>
                      <X size={13} /> Clear All
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setPanelOpen(false)}>
                      Apply Filters
                    </button>
                  </div>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Result count & sort quick pick */}
          <div className="toolbar-meta">
            <span className="result-count">{total} product{total !== 1 ? 's' : ''}</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              title="Sort by"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* ── Active filter chips ─────────────────────────────────────────── */}
        {activeFilterCount > 0 && (
          <div className="active-filter-chips">
            {category && (
              <span className="filter-chip">
                {category}
                <button onClick={() => setParam('category', '')}><X size={11} /></button>
              </span>
            )}
            {search && (
              <span className="filter-chip">
                "{search}"
                <button onClick={() => { setSearchInput(''); setParam('search', ''); }}><X size={11} /></button>
              </span>
            )}
            {inStock === 'true' && (
              <span className="filter-chip">
                In Stock
                <button onClick={() => setParam('inStock', '')}><X size={11} /></button>
              </span>
            )}
            {(priceRange.min !== null || priceRange.max !== null) && (
              <span className="filter-chip">
                {priceRange.label}
                <button onClick={() => setPriceRange(PRICE_RANGES[0])}><X size={11} /></button>
              </span>
            )}
            {featured && (
              <span className="filter-chip">
                Featured
                <button onClick={() => setFeatured(false)}><X size={11} /></button>
              </span>
            )}
            {sortBy && (
              <span className="filter-chip">
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                <button onClick={() => setSortBy('')}><X size={11} /></button>
              </span>
            )}
            <button className="clear-all-chips" onClick={clearAll}>Clear all</button>
          </div>
        )}

        {/* ── Category quick links ─────────────────────────────────────────── */}
        <div className="cat-pill-row">
          <button
            className={`cat-pill${!category ? ' active' : ''}`}
            onClick={() => setParam('category', '')}
          >All</button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-pill${category === cat ? ' active' : ''}`}
              onClick={() => setParam('category', cat === category ? '' : cat)}
            >{cat}</button>
          ))}
        </div>

        {/* ── Products grid ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="products-loading"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <div className="empty-emoji">🔍</div>
            <h3>No Products Found</h3>
            <p>Try adjusting your search terms or clearing the filters.</p>
            <button className="btn btn-dark" onClick={clearAll}>Clear Filters</button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────────── */}
        {pages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', page - 1); setSearchParams(p); }}
            >←</button>
            {[...Array(pages)].map((_, i) => (
              <button
                key={i}
                className={`page-btn${page === i + 1 ? ' active' : ''}`}
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', i + 1); setSearchParams(p); }}
              >{i + 1}</button>
            ))}
            <button
              className="page-btn"
              disabled={page >= pages}
              onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', page + 1); setSearchParams(p); }}
            >→</button>
          </div>
        )}
      </div>
    </div>
  );
}
