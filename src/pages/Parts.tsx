import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, ShoppingCart, Eye, ChevronDown, CheckCircle2, 
  Settings, Truck, ShieldCheck, HelpCircle, Users, Star, 
  ArrowRight, Package, Wrench, Zap, Droplet, Circle, CircleDot, 
  Lightbulb, Tag
} from 'lucide-react';
import ScrollToFooterArrow from '@/components/ui/ScrollToFooterArrow';
import { cn } from '@/lib/utils';
import SEO from '@/components/seo/SEO';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useContent } from '@/hooks/useContent';
import { useInventoryParts } from '@/hooks/useInventory';
import EditableText from '@/components/editable/EditableText';
import {
  engineOilFluidsMaintenance,
  brakePartsDiskMaintenance,
  tyreMaintenance,
  filtersMaintenance,
  suspensionPartsMaintenance,
  carLightingMaintenance,
} from '@/assets/images';
import { sanitizeHttpUrl, sanitizeImageUrl } from '@/lib/security';
import { buildFaqSchema, buildServiceSchema } from '@/lib/seoSchemas';

const CATEGORIES = [
  { name: 'Car Batteries', icon: Zap, img: engineOilFluidsMaintenance },
  { name: 'Engine Oil & Fluids', icon: Droplet, img: engineOilFluidsMaintenance },
  { name: 'Brake Pads & Discs', icon: Circle, img: brakePartsDiskMaintenance },
  { name: 'Tires', icon: CircleDot, img: tyreMaintenance },
  { name: 'Filters', icon: Settings, img: filtersMaintenance },
  { name: 'Suspension Parts', icon: Wrench, img: suspensionPartsMaintenance },
  { name: 'Lighting', icon: Lightbulb, img: carLightingMaintenance },
  { name: 'Accessories', icon: Package, img: brakePartsDiskMaintenance },
];

const WHY_BUY = [
  { title: '100% Genuine Parts', icon: CheckCircle2 },
  { title: 'Competitive Pricing', icon: Tag },
  { title: 'Fast Delivery/Pickup', icon: Truck },
  { title: 'Warranty on Parts', icon: ShieldCheck },
  { title: 'Expert Advice', icon: HelpCircle },
  { title: 'Bulk/Fleet Discounts', icon: Users },
];

const BRANDS = [
  'Bosch', 'Michelin', 'Castrol', 'Brembo', 'NGK', 'K&N', 'Philips', 'Valvoline'
];

const PARTS_FAQS = [
  { q: 'How do I know if a part is compatible with my car?', a: 'You can use our "Shop by Car" tool to filter parts specifically for your car\'s make, model, and year. If you are unsure, our expert team is always available to verify compatibility via phone or WhatsApp using your VIN.' },
  { q: 'Do you offer warranties on your parts and batteries?', a: 'Yes! All our genuine parts and batteries come with a manufacturer\'s warranty, typically ranging from 6 months to 2 years depending on the item.' },
  { q: 'What are your delivery options?', a: 'We offer same-day delivery within the city for orders placed before 12 PM, standard next-day delivery, and free in-store pickup at any of our branches.' },
  { q: 'What is your return or exchange policy?', a: 'Unused parts in their original, undamaged packaging can be returned or exchanged within 14 days of purchase with a valid receipt. Electrical components may be subject to specific restrictions.' },
  { q: 'Do you offer installation services for the parts I buy?', a: 'Yes, our on-site auto repair shop can professionally install any parts or batteries you purchase from us at a discounted labor rate.' },
];

const CAR_MODELS_MAP: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'Hilux', 'RAV4'],
  Honda: ['Civic', 'Accord', 'CR-V'],
  Mercedes: ['C-Class', 'E-Class', 'GLE'],
};

const categoryMatches = (productCat: string, selectedCat: string): boolean => {
  if (selectedCat === 'All') return true;
  const p = (productCat || '').toLowerCase();
  const s = selectedCat.toLowerCase();
  if (p === s || p.includes(s) || s.includes(p)) return true;
  if (s === 'oil & fluids' && (p.includes('oil') || p.includes('fluid'))) return true;
  if (s === 'batteries' && p.includes('batter')) return true;
  return false;
};

export default function Parts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'All';
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [appliedCarFilter, setAppliedCarFilter] = useState<{ make: string; model: string; year: string } | null>(null);
  const [addedPartId, setAddedPartId] = useState<string | number | null>(null);

  const whatsapp = useContent('global.links.whatsapp', 'https://wa.me/233244753849');
  const safeWhatsapp = sanitizeHttpUrl(whatsapp, 'https://wa.me/233244753849');
  const whatsappJoinChar = safeWhatsapp.includes('?') ? '&' : '?';
  const partsTitle = useContent('parts.title', 'Original Auto Parts & Batteries');
  const partsDesc = useContent('parts.description', 'Quality batteries, filters, brake pads, tires, and accessories for every make and model.');

  useEffect(() => {
    const paramCat = searchParams.get('category');
    if (paramCat) {
      setActiveCategory(paramCat);
      setTimeout(() => {
        document.getElementById('parts-products')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      setActiveCategory('All');
    }
  }, [searchParams]);

  const { parts } = useInventoryParts();

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const knownMakes = ['toyota', 'honda', 'mercedes', 'hyundai', 'kia', 'nissan', 'ford', 'bmw', 'vw', 'volkswagen'];
    const knownModels = Object.values(CAR_MODELS_MAP).flat().map(m => m.toLowerCase());

    return parts.filter((p) => {
      if (!categoryMatches(p.category || '', activeCategory)) return false;
      if (q) {
        const hay = `${p.name || ''} ${p.brand || ''} ${p.category || ''} ${(p as any).sku || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (appliedCarFilter) {
        const compat = `${(p as any).compatibility || ''} ${p.name || ''}`.toLowerCase();
        const mentionsSpecificMake = knownMakes.some(m => compat.includes(m));
        const makeTerm = appliedCarFilter.make.toLowerCase();
        const modelTerm = appliedCarFilter.model.toLowerCase();
        if (mentionsSpecificMake && makeTerm) {
          if (!compat.includes(makeTerm)) return false;
          if (modelTerm) {
            const mentionsSpecificModel = knownModels.some(m => compat.includes(m));
            if (mentionsSpecificModel && !compat.includes(modelTerm)) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }, [parts, activeCategory, searchQuery, appliedCarFilter]);

  const scrollToProducts = () => {
    document.getElementById('parts-products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <main className="pt-24 lg:pt-[104px] min-h-screen">
      <SEO
        title="Genuine Auto Parts & Accessories | Santa Towing"
        description="Shop high-quality OEM and aftermarket spare parts, car batteries, tires, brake pads, and engine oils in Ghana for all major car makes and models."
        keywords="auto parts Ghana, genuine spare parts Accra, car batteries Ghana, brake pads tires oil filters, Santa Towing"
        canonical="/parts"
        image={tyreMaintenance}
        imageAlt="Genuine auto parts, car batteries, and tires at Santa Towing Ghana"
        schema={[
          buildServiceSchema({
            name: partsTitle,
            description: partsDesc,
            path: '/parts',
            serviceType: 'Auto Parts & Accessories Supply',
          }),
          buildFaqSchema(PARTS_FAQS),
        ]}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-slate-50 border-b border-dark/10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Auto Parts' }]} />
        </div>
      </div>
      
      {/* 1. Hero Banner */}
      <section className="relative bg-primary overflow-hidden pt-12 pb-32 md:pt-24 md:pb-40">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${tyreMaintenance})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            <EditableText
              storageKey="parts.hero.title"
              defaultContent={partsTitle}
              label="Parts Hero Title"
            />
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/70 mb-10 max-w-3xl mx-auto"
          >
            <EditableText
              as="p"
              multiline={true}
              storageKey="parts.hero.desc"
              defaultContent={partsDesc}
              label="Parts Hero Description"
            />
          </motion.div>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={(e) => { e.preventDefault(); scrollToProducts(); }}
            className="max-w-2xl mx-auto bg-white p-2 rounded-[1px] flex items-center shadow-2xl mb-10"
          >
            <div className="pl-2.5 sm:pl-4 pr-1.5 sm:pr-2 text-dark/70 shrink-0">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <input 
              type="text"
              maxLength={120}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.slice(0, 120))}
              placeholder="Search by part name, make/model, or part number..." 
              className="flex-1 min-w-0 py-3 px-2 text-sm sm:text-base text-dark focus:outline-none"
            />
            <button type="submit" className="bg-accent hover:bg-accent/90 text-white px-4 sm:px-6 py-3 font-bold text-sm sm:text-base transition-all rounded-full shrink-0">
              Search
            </button>
          </motion.form>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              type="button"
              onClick={scrollToProducts}
              className="bg-accent hover:bg-accent/90 text-white px-4 sm:px-8 py-4 font-bold transition-all shadow-lg shadow-accent/30 rounded-full"
            >
              Shop All Parts
            </button>
            <a
              href={`${safeWhatsapp}${whatsappJoinChar}text=${encodeURIComponent('Hello Santa Towing, I would like a quote for auto parts.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 sm:px-8 py-4 font-bold transition-all border border-white/20 rounded-full"
            >
              Get a Quote
            </a>
          </motion.div>
        </div>
      
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 ">
          <ScrollToFooterArrow />
        </div>
      </section>

      {/* 4. Shop by Car (Moved up for logic flow) */}
      <section className="relative z-20 -mt-12 mb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[1px] shadow-xl p-6 sm:p-8 border border-dark/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="md:w-1/4">
            <h2 className="text-xl font-bold text-dark">Shop by Car</h2>
            <p className="text-sm text-dark/70">Find exact fit parts</p>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <select
              value={selectedMake}
              onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel(''); }}
              className="bg-white border border-dark/20 rounded-lg px-4 py-3 text-dark/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent appearance-none"
            >
              <option value="">Make</option>
              {Object.keys(CAR_MODELS_MAP).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-white border border-dark/20 rounded-lg px-4 py-3 text-dark/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent appearance-none"
            >
              <option value="">Model</option>
              {(selectedMake ? CAR_MODELS_MAP[selectedMake] || [] : Object.values(CAR_MODELS_MAP).flat()).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-dark/20 rounded-lg px-4 py-3 text-dark/70 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent appearance-none"
            >
              <option value="">Year</option>
              {['2024', '2023', '2022', '2021', '2020'].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              if (selectedMake || selectedModel || selectedYear) {
                setAppliedCarFilter({ make: selectedMake, model: selectedModel, year: selectedYear });
              } else {
                setAppliedCarFilter(null);
              }
              scrollToProducts();
            }}
            className="w-full md:w-auto bg-primary hover:bg-black text-white px-6 py-3 font-bold transition-all rounded-full"
          >
            Find Parts
          </button>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-2">Shop by Category</h2>
              <p className="text-dark/70">Everything you need for your car.</p>
            </div>
            <Link to="/parts" className="hidden md:flex items-center gap-2 text-accent font-bold hover:text-accent transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={idx}
                  to={`/parts?category=${encodeURIComponent(cat.name)}`}
                  className="bg-white rounded-[1px] overflow-hidden group hover:shadow-lg transition-shadow border border-dark/10"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img src={cat.img} alt={`${cat.name} auto parts at Santa Towing Ghana`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between gap-1.5">
                      <h3 className="font-bold text-white text-xs sm:text-sm md:text-base leading-tight min-w-0">{cat.name}</h3>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary backdrop-blur-md rounded-xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-secondary transition-colors shrink-0">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section id="parts-products" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-2">Featured Products</h2>
              <p className="text-dark/70">Top-rated parts and accessories.</p>
              {(appliedCarFilter || activeCategory !== 'All' || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  {appliedCarFilter && (
                    <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full">
                      Vehicle: {[appliedCarFilter.make, appliedCarFilter.model, appliedCarFilter.year].filter(Boolean).join(' ')}
                    </span>
                  )}
                  {activeCategory !== 'All' && (
                    <span className="bg-accent/10 text-accent font-bold px-3 py-1 rounded-full">
                      Category: {activeCategory}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setAppliedCarFilter(null); handleSelectCategory('All'); }}
                    className="text-dark/70 hover:text-dark underline font-semibold"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', ...CATEGORIES.map(c => c.name)].map(cat => (
                <button 
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-md font-bold text-sm whitespace-nowrap transition-colors border",
                    (cat !== 'All' && categoryMatches(activeCategory, cat)) || (cat === 'All' && activeCategory === 'All')
                      ? "bg-primary text-white border-primary" 
                      : "bg-white text-dark/70 border-dark/15 hover:bg-slate-50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="bg-slate-50 border border-dark/10 rounded-[1px] p-10 text-center">
              <Package className="w-12 h-12 text-dark/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-dark mb-2">No matching auto parts found</h3>
              <p className="text-dark/70 mb-6 text-sm">Try another category or clear your search filter.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setAppliedCarFilter(null); handleSelectCategory('All'); }}
                className="bg-primary hover:bg-black text-white px-6 py-3 font-bold rounded-full transition-colors"
              >
                Show All Parts
              </button>
            </div>
          ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[1px] p-4 border border-dark/10 hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="aspect-[4/3] rounded-[1px] overflow-hidden mb-6 relative bg-white">
                  <img src={sanitizeImageUrl(product.image, tyreMaintenance)} alt={`${product.name} by ${product.brand} - genuine auto parts Ghana`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <Link to={`/parts/${product.id}`} className="w-12 h-12 bg-white flex items-center justify-center text-dark hover:bg-accent hover:text-white transition-colors shadow-lg rounded-full" title="Quick View">
                      <Eye className="w-5 h-5" />
                    </Link>
                    <a
                      href={`${safeWhatsapp}${whatsappJoinChar}text=${encodeURIComponent(`Hello Santa Towing, I would like to order: ${product.name} (${product.price}).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setAddedPartId(product.id)}
                      className="w-12 h-12 bg-accent text-white flex items-center justify-center hover:bg-accent transition-colors shadow-lg rounded-full"
                      title="Order on WhatsApp"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </a>
                  </div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-[1px] text-xs font-bold text-dark shadow-sm">
                    {product.brand}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-dark/20")} />
                  ))}
                  <span className="text-xs text-dark/70 ml-1">({product.rating})</span>
                </div>
                
                <Link to={`/parts/${product.id}`} className="hover:text-accent transition-colors">
                  <h3 className="font-bold text-dark text-lg mb-1 leading-tight">{product.name}</h3>
                </Link>
                <p className="text-sm text-dark/70 mb-4 flex-1">{product.category}</p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-dark/10">
                  <div className="text-xl font-bold text-accent">{product.price}</div>
                  <Link to={`/parts/${product.id}`} className="text-sm font-bold text-dark hover:text-accent transition-colors flex items-center gap-1 rounded-full">
                    {addedPartId === product.id ? 'Requested' : 'View Details'} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* 5. Why Buy Parts From Us */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Buy From Us</h2>
            <p className="text-white/80 text-lg">Guaranteed quality and exceptional service.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {WHY_BUY.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-[1px] p-6 text-center hover:bg-accent transition-all group"
                >
                  <Icon className="w-10 h-10 mx-auto text-white mb-4 transition-colors" />
                  <h3 className="font-bold text-sm md:text-base leading-tight">{feature.title}</h3>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Top Brands */}
      <section className="py-10 md:py-16 bg-white border-b border-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold text-dark/70 uppercase tracking-widest mb-8">Trusted Top Brands</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {BRANDS.map((brand, idx) => (
              <div key={idx} className="text-xl md:text-2xl font-black text-dark uppercase italic">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 8. FAQs */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Parts & Ordering FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {PARTS_FAQS.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-dark/20 rounded-[1px] overflow-hidden shadow-sm bg-white"
              >
                <button 
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-50 transition-colors rounded-full"
                >
                  <span className="font-bold text-dark pr-4">{faq.q}</span>
                  <ChevronDown className={cn("w-5 h-5 text-primary transition-transform shrink-0", openFaqIdx === idx && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {openFaqIdx === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-5 text-dark/70">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Call-to-Action Banner */}
      <section className="py-16 md:py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.5) 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Need Help Finding the Right Part?</h2>
          <p className="text-lg md:text-xl mb-10 text-white/90">
            Our experts are standing by to help you locate exact-fit components for your car.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={scrollToProducts}
              className="bg-accent hover:bg-accent/90 text-white px-4 sm:px-8 py-4 font-bold transition-all shadow-xl rounded-full"
            >
              Shop All Parts
            </button>
            <a href={safeWhatsapp} target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-dark/5 text-dark px-4 sm:px-8 py-4 font-bold transition-all shadow-xl rounded-full">
              Contact Our Parts Team
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
