import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search as SearchIcon, ArrowRight, FileText, MapPin, Truck, Wrench, Shield, Car } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SEO from '@/components/seo/SEO';
import { useContent } from '@/hooks/useContent';
import { SEARCH_INDEX, type SearchIndexItem } from '@/data/searchIndex';
import {
  useInventoryCars,
  useInventoryRentals,
  useInventoryParts,
  useInventoryGallery,
  useInventoryFaqs,
  useInventoryCareers,
} from '@/hooks/useInventory';
import { BLOG_POSTS } from '@/data/blogData';
import { ALL_AREAS } from '@/data/serviceAreasDirectory';
import { TOWING_ADVERTS } from '@/data/towingAdverts';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'service': return <Wrench className="w-5 h-5 text-accent" />;
    case 'location': return <MapPin className="w-5 h-5 text-accent" />;
    case 'car': return <Car className="w-5 h-5 text-accent" />;
    case 'policy': return <Shield className="w-5 h-5 text-accent" />;
    default: return <FileText className="w-5 h-5 text-accent" />;
  }
};

const MAX_QUERY_LEN = 120;

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = (searchParams.get('q') || '').slice(0, MAX_QUERY_LEN);
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const seoTitle = useContent('seo.search.title', 'Search Results | Santa Towing');
  const seoDesc = useContent('seo.search.description', 'Search results for Santa Towing.');

  // Update query when URL params change
  useEffect(() => {
    const q = (searchParams.get('q') || '').slice(0, MAX_QUERY_LEN);
    setQuery(q);
    setInputValue(q);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = inputValue.trim().slice(0, MAX_QUERY_LEN);
    if (normalized) {
      setSearchParams({ q: normalized });
    } else {
      setSearchParams({});
    }
  };

  const { cars } = useInventoryCars();
  const { rentals } = useInventoryRentals();
  const { parts } = useInventoryParts();
  const { galleryItems: gallery } = useInventoryGallery();
  const { faqs } = useInventoryFaqs();
  const { careers } = useInventoryCareers();
  const blogPosts = useContent<typeof BLOG_POSTS>('blog.posts', BLOG_POSTS);

  const combinedIndex = useMemo(() => {
    const itemsMap = new Map<string, SearchIndexItem>();
    const addEntry = (item: SearchIndexItem) => {
      const normPath = item.path.toLowerCase().replace(/\/+$/, '') || '/';
      const dedupKey = normPath === '/faqs' || normPath === '/gallery' || normPath === '/careers'
        ? `${normPath}::${item.title.toLowerCase()}`
        : normPath;
      if (!itemsMap.has(dedupKey)) {
        itemsMap.set(dedupKey, item);
      }
    };

    SEARCH_INDEX.forEach(addEntry);

    cars.forEach(c => addEntry({
      title: c.name,
      path: `/sales/${c.id}`,
      type: 'car',
      excerpt: `${c.type} • ${c.year} • ${c.price}${c.description ? ` — ${c.description}` : ''}`,
      keywords: [c.name, c.type, c.fuel, c.transmission, String(c.year), c.make || '', c.model || '', 'car', 'sale', 'buy'].filter(Boolean),
    }));

    rentals.forEach(r => addEntry({
      title: `${r.name} (Rental)`,
      path: `/rental/${r.id}`,
      type: 'car',
      excerpt: `${r.category} • ${r.daily}/day${r.description ? ` — ${r.description}` : ''}`,
      keywords: [r.name, r.category, r.type, r.fuel, 'rental', 'hire', 'rent'].filter(Boolean),
    }));

    parts.forEach(p => addEntry({
      title: p.name,
      path: `/parts/${p.id}`,
      type: 'service',
      excerpt: `${p.brand} • ${p.category} • ${p.price}${p.description ? ` — ${p.description}` : ''}`,
      keywords: [p.name, p.brand, p.category, p.sku, 'parts', 'spare parts'].filter(Boolean),
    }));

    gallery.forEach(g => addEntry({
      title: `Gallery: ${g.title}`,
      path: '/gallery',
      type: 'page',
      excerpt: g.description || g.category,
      keywords: [g.title, g.category, 'gallery', 'photos'].filter(Boolean),
    }));

    faqs.forEach(f => addEntry({
      title: f.q,
      path: '/faqs',
      type: 'policy',
      excerpt: f.a,
      keywords: [f.category, 'faq', 'question', 'help'].filter(Boolean),
    }));

    careers
      .filter(j => j.status !== 'Closed' && j.status !== 'Draft')
      .forEach(j => addEntry({
        title: `Career: ${j.title}`,
        path: '/careers',
        type: 'page',
        excerpt: `${j.department} • ${j.location} — ${j.description}`,
        keywords: [j.title, j.department, j.location, j.type, 'career', 'job', 'hiring'].filter(Boolean),
      }));

    (Array.isArray(blogPosts) ? blogPosts : BLOG_POSTS).forEach(b => addEntry({
      title: b.title,
      path: `/blog/${b.id}`,
      type: 'page',
      excerpt: b.excerpt,
      keywords: [b.category, b.author, ...(Array.isArray(b.tags) ? b.tags : []), 'blog', 'article'].filter(Boolean),
    }));

    ALL_AREAS.forEach(a => addEntry({
      title: `${a.label} Towing Services`,
      path: a.path,
      type: 'location',
      excerpt: `24/7 emergency towing, recovery, and roadside assistance across ${a.label} (${a.region}).`,
      keywords: [a.label, a.region, 'towing', 'recovery', 'roadside assistance'],
    }));

    TOWING_ADVERTS.forEach(adv => addEntry({
      title: adv.title,
      path: `/service-areas/${adv.district.toLowerCase().replace(/ /g, '-')}`,
      type: 'location',
      excerpt: adv.description.split('\n')[0] || adv.title,
      keywords: [adv.district, adv.title, 'towing', 'service area', 'recovery'],
    }));

    return Array.from(itemsMap.values());
  }, [cars, rentals, parts, gallery, faqs, careers, blogPosts]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase().trim();
    
    return combinedIndex.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(lowerQuery);
      const matchExcerpt = item.excerpt.toLowerCase().includes(lowerQuery);
      const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(lowerQuery));
      return matchTitle || matchExcerpt || matchKeywords;
    }).map(item => {
      // Calculate a simple relevance score
      let score = 0;
      if (item.title.toLowerCase().includes(lowerQuery)) score += 3;
      if (item.keywords.some(k => k.toLowerCase().includes(lowerQuery))) score += 2;
      if (item.excerpt.toLowerCase().includes(lowerQuery)) score += 1;
      
      return { ...item, score };
    }).sort((a, b) => b.score - a.score);
  }, [query, combinedIndex]);

  // Helper to highlight matching text
  const highlightMatch = (text: string, highlight: string) => {
    const trimmed = highlight.trim();
    if (!trimmed) return text;
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <span key={i} className="bg-accent/20 text-dark font-semibold rounded-[1px] px-0.5">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 md:pb-20">
      <SEO title={seoTitle} description={seoDesc} canonical="/search" noindex />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Breadcrumbs items={[{ label: 'Search Results' }]} className="mb-6" />
        
        <div className="bg-white rounded-[1px] shadow-sm border border-dark/10 p-6 sm:p-8 md:p-10 mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-dark mb-6 tracking-tight">
            Search
          </h1>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                type="text"
                maxLength={MAX_QUERY_LEN}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.slice(0, MAX_QUERY_LEN))}
                placeholder="Search services, locations, cars..."
                className="w-full bg-slate-50 border-2 border-dark/10 focus:border-primary py-3.5 sm:py-4 pl-10 sm:pl-14 pr-24 sm:pr-32 text-sm sm:text-base text-dark font-medium outline-none transition-all"
                autoFocus
              />
              <SearchIcon className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-dark/40" />
              <button 
                type="submit"
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-black text-white px-3.5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-base font-bold transition-colors rounded-full"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        {query.trim() && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-dark break-words min-w-0">
                Results for "{query}"
              </h2>
              <span className="text-dark/60 font-medium bg-dark/5 px-3 py-1 rounded-full text-sm shrink-0">
                {results.length} found
              </span>
            </div>

            {results.length > 0 ? (
              <div className="flex flex-col gap-4">
                {results.map((result, idx) => (
                  <motion.div
                    key={`${result.path}-${result.title}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link 
                      to={result.path}
                      className="block bg-white p-6 rounded-[1px] shadow-sm border border-dark/5 hover:border-primary/30 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-slate-50 p-3 rounded-[1px] shrink-0 group-hover:bg-primary/10 transition-colors">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-accent/80">
                              {result.type}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-dark mb-2 group-hover:text-primary transition-colors line-clamp-1">
                            {highlightMatch(result.title, query)}
                          </h3>
                          <p className="text-dark/70 text-sm leading-relaxed line-clamp-2">
                            {highlightMatch(result.excerpt, query)}
                          </p>
                        </div>
                        <div className="hidden sm:flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-slate-50 group-hover:bg-primary text-dark/40 group-hover:text-white transition-colors">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-6 sm:p-8 md:p-12 rounded-[1px] text-center border border-dark/10 border-dashed"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-8 h-8 text-dark/30" />
                </div>
                <h3 className="text-2xl font-bold text-dark mb-3">No results found</h3>
                <p className="text-dark/60 max-w-md mx-auto mb-8">
                  We couldn't find anything matching "{query}". Try searching with a different keyword or check out our popular sections below.
                </p>
                
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/towing" className="bg-slate-50 hover:bg-primary/10 hover:text-primary text-dark px-5 py-2.5 font-semibold transition-colors text-sm rounded-full">
                    Towing Services
                  </Link>
                  <Link to="/repairs" className="bg-slate-50 hover:bg-primary/10 hover:text-primary text-dark px-5 py-2.5 font-semibold transition-colors text-sm rounded-full">
                    Auto Repairs
                  </Link>
                  <Link to="/contact" className="bg-slate-50 hover:bg-primary/10 hover:text-primary text-dark px-5 py-2.5 font-semibold transition-colors text-sm rounded-full">
                    Contact Us
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        )}
        
        {/* Suggestion when no query */}
        {!query.trim() && (
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/towing" className="flex flex-col items-center justify-center p-6 bg-white rounded-[1px] border border-dark/5 hover:border-primary/50 hover:shadow-md transition-all group text-center gap-3">
              <div className="w-12 h-12 bg-secondary group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-secondary group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <span className="font-bold text-dark group-hover:text-primary transition-colors">Towing</span>
            </Link>
            <Link to="/repairs" className="flex flex-col items-center justify-center p-6 bg-white rounded-[1px] border border-dark/5 hover:border-primary/50 hover:shadow-md transition-all group text-center gap-3">
              <div className="w-12 h-12 bg-secondary group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-secondary group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <span className="font-bold text-dark group-hover:text-accent transition-colors">Repairs</span>
            </Link>
            <Link to="/service-areas" className="flex flex-col items-center justify-center p-6 bg-white rounded-[1px] border border-dark/5 hover:border-primary/50 hover:shadow-md transition-all group text-center gap-3">
              <div className="w-12 h-12 bg-secondary group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-secondary group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="font-bold text-dark group-hover:text-blue-500 transition-colors">Locations</span>
            </Link>
            <Link to="/faqs" className="flex flex-col items-center justify-center p-6 bg-white rounded-[1px] border border-dark/5 hover:border-primary/50 hover:shadow-md transition-all group text-center gap-3">
              <div className="w-12 h-12 bg-secondary group-hover:bg-white rounded-full flex items-center justify-center text-white group-hover:text-secondary group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-bold text-dark group-hover:text-emerald-500 transition-colors">Help & FAQs</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
