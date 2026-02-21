import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const page = parseInt(searchParams.get('page') || '0');
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDir = searchParams.get('sortDir') || 'desc';

  useEffect(() => {
    productApi.getCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productApi.getAll({ page, size: 12, category, search, sortBy, sortDir })
      .then(r => { setProducts(r.data.content || []); setTotalPages(r.data.totalPages || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, category, search, sortBy, sortDir]);

  const setParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.set('page', '0');
    setSearchParams(p);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">
          {search ? `Results for "${search}"` : category ? category : 'All Products'}
        </h1>
        {(search || category) && (
          <button onClick={() => setSearchParams({})}
            className="mt-2 flex items-center gap-1 font-sans text-xs text-gray-500 hover:text-gold-500 transition-colors">
            <FiX size={12} /> Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="card-luxe p-4 mb-4">
            <h3 className="font-sans text-xs tracking-widest uppercase text-gold-500 mb-4">Categories</h3>
            <button onClick={() => setParam('category', '')}
              className={`block w-full text-left font-sans text-sm py-2 px-3 mb-1 transition-colors rounded-sm
                ${!category ? 'bg-gold-500/10 text-gold-500' : 'text-gray-400 hover:text-white'}`}>
              All Products
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setParam('category', cat)}
                className={`block w-full text-left font-sans text-sm py-2 px-3 mb-1 transition-colors rounded-sm
                  ${category === cat ? 'bg-gold-500/10 text-gold-500' : 'text-gray-400 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="card-luxe p-4">
            <h3 className="font-sans text-xs tracking-widest uppercase text-gold-500 mb-4">Sort By</h3>
            {[
              { label: 'Newest', sortBy: 'createdAt', sortDir: 'desc' },
              { label: 'Price: Low–High', sortBy: 'price', sortDir: 'asc' },
              { label: 'Price: High–Low', sortBy: 'price', sortDir: 'desc' },
              { label: 'Top Rated', sortBy: 'rating', sortDir: 'desc' },
            ].map(opt => (
              <button key={opt.label}
                onClick={() => { setParam('sortBy', opt.sortBy); setParam('sortDir', opt.sortDir); }}
                className={`block w-full text-left font-sans text-sm py-2 px-3 mb-1 transition-colors rounded-sm
                  ${sortBy === opt.sortBy && sortDir === opt.sortDir ? 'bg-gold-500/10 text-gold-500' : 'text-gray-400 hover:text-white'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card-luxe aspect-[3/4] animate-pulse bg-luxe-card" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="font-display text-2xl mb-2">No products found</p>
              <p className="font-sans text-sm">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setParam('page', String(i))}
                  className={`w-8 h-8 font-sans text-sm transition-colors
                    ${page === i ? 'bg-gold-500 text-luxe-black' : 'border border-luxe-border text-gray-400 hover:border-gold-500 hover:text-gold-500'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
