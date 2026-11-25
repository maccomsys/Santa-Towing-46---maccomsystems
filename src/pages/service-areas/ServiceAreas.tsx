import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Phone, MessageCircle, MapPin, X, Navigation } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SEO from '@/components/seo/SEO';
import { useContent } from '@/hooks/useContent';
import { ZONES, ALL_AREAS } from '@/data/serviceAreasDirectory';
import { sanitizeHttpUrl, sanitizeTelUrl } from '@/lib/security';
import { buildServiceSchema } from '@/lib/seoSchemas';

export default function ServiceAreas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const seoTitle = useContent('seo.serviceAreas.title', 'Service Areas Directory | 24/7 Nationwide Towing | Santa Towing');
  const seoDesc = useContent('seo.serviceAreas.description', 'Explore 260+ rapid emergency towing and recovery routes across Greater Accra, Western Region, Ashanti Region, Northern Ghana, and all 16 regions.');
  const badge = useContent('serviceAreas.badge', 'Nationwide Coverage');
  const title = useContent('serviceAreas.title', 'Service Areas & Routes Directory');
  const description = useContent('serviceAreas.description', 'Browse our 24/7 emergency towing, accident recovery, and intercity haulage corridors grouped by geographic zone. Fast response dispatch across all 16 regions of Ghana.');
  const ctaBadge = useContent('serviceAreas.ctaBadge', 'Need Fast Towing Service?');
  const ctaHeading = useContent('serviceAreas.ctaHeading', '24/7 Rapid Emergency Dispatch Nationwide');
  const ctaDescription = useContent('serviceAreas.ctaDescription', 'Whether you need car breakdown recovery on the highway or long-haul car haulage between cities, our operators are on standby 24/7 across Ghana.');
  const phoneRaw = useContent('global.links.phone', '0244753849');
  const phoneFormatted = useContent('global.links.phoneFormatted', '024 475 3849');
  const phoneTel = useContent('global.links.phoneTel', 'tel:0244753849');
  const whatsapp = useContent('global.links.whatsapp', 'https://wa.me/233244753849');
  const safePhoneTel = sanitizeTelUrl(phoneTel || `tel:${phoneRaw}`);
  const safeWhatsapp = sanitizeHttpUrl(whatsapp, 'https://wa.me/233244753849');

  // Client-side pure JS filter over the hardcoded list
  const filteredAreas = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return ALL_AREAS.filter(area => {
      // Zone filter matching
      if (selectedZone !== 'all') {
        const zoneDef = ZONES.find(z => z.id === selectedZone);
        if (zoneDef && !zoneDef.matchRegions.includes(area.region)) {
          return false;
        }
      }

      // Search query matching across label, region, and zone name
      if (!query) return true;

      const matchesLabel = area.label.toLowerCase().includes(query);
      const matchesRegion = area.region.toLowerCase().includes(query);
      
      const parentZone = ZONES.find(z => z.matchRegions.includes(area.region));
      const matchesZoneName = parentZone ? parentZone.name.toLowerCase().includes(query) : false;

      return matchesLabel || matchesRegion || matchesZoneName;
    });
  }, [searchQuery, selectedZone]);

  // Group filtered results by Zone
  const groupedZones = useMemo(() => {
    return ZONES.map(zone => {
      const areas = filteredAreas.filter(area => zone.matchRegions.includes(area.region));
      return {
        ...zone,
        areas
      };
    }).filter(group => group.areas.length > 0);
  }, [filteredAreas]);

  const totalResultsCount = filteredAreas.length;

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDesc}
        keywords="Santa Towing service areas, towing coverage Ghana, Greater Accra towing routes, Kumasi towing, Takoradi Tamale roadside assistance"
        canonical="/service-areas"
        schema={buildServiceSchema({
          name: title,
          description: seoDesc,
          path: '/service-areas',
          serviceType: '24/7 Emergency Towing & Recovery Coverage',
        })}
      />
      
      <main className="pt-24 lg:pt-[104px] pb-16 md:pb-24 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'Service Areas Directory' }]} />
          </div>

          {/* Header Section */}
          <div className="mb-8 md:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-dark/10">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider rounded-full mb-3">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{badge}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-dark tracking-tight mb-4">
                  {title}
                </h1>
                <p className="text-dark/70 text-base sm:text-lg leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Hotline Quick Call Widget */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-dark/10 shadow-sm flex items-center justify-between sm:justify-start gap-4 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <Phone className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-dark/60 uppercase tracking-wider">24/7 Emergency Dispatch</div>
                  <a href={safePhoneTel} className="text-xl sm:text-2xl font-black text-dark hover:text-accent transition-colors">
                    {phoneFormatted}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Instant Filter Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-dark/10 shadow-sm mb-10">
            <div className="max-w-4xl mx-auto">
              <label htmlFor="area-search" className="block text-sm font-bold text-dark mb-2">
                Instant Route &amp; Town Search
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-dark/40" />
                </div>
                <input
                  id="area-search"
                  type="text"
                  maxLength={120}
                  placeholder="Type a town or route name (e.g. Kumasi, Spintex, Takoradi, Tamale, Cape Coast)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.slice(0, 120))}
                  className="w-full pl-11 sm:pl-13 pr-11 sm:pr-12 py-3.5 sm:py-4 bg-slate-50 border border-dark/15 rounded-xl text-dark text-base sm:text-lg placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-4 sm:pr-5 flex items-center text-dark/40 hover:text-dark transition-colors"
                    aria-label="Clear search query"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Zone Filter Chips */}
              <div className="mt-5 pt-5 border-t border-dark/5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-dark/60 uppercase tracking-wider">Filter by Zone / Region:</span>
                  {(searchQuery || selectedZone !== 'all') && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSelectedZone('all'); }}
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Reset all filters
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedZone('all')}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                      selectedZone === 'all'
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-dark/70 hover:bg-slate-200'
                    }`}
                  >
                    All Zones ({ALL_AREAS.length})
                  </button>
                  {ZONES.map((zone) => {
                    const zoneCount = ALL_AREAS.filter(a => zone.matchRegions.includes(a.region)).length;
                    const isSelected = selectedZone === zone.id;
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => setSelectedZone(isSelected ? 'all' : zone.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-slate-100 text-dark/70 hover:bg-slate-200'
                        }`}
                      >
                        {zone.name} ({zoneCount})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Search Status Bar */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-dark/60 gap-1">
                <div>
                  {searchQuery ? (
                    <span>
                      Found <strong className="text-dark font-bold">{totalResultsCount}</strong> {totalResultsCount === 1 ? 'area' : 'areas'} matching &ldquo;<span className="text-primary font-bold">{searchQuery}</span>&rdquo;
                    </span>
                  ) : selectedZone !== 'all' ? (
                    <span>
                      Showing <strong className="text-dark font-bold">{totalResultsCount}</strong> areas in <strong className="text-primary font-bold">{ZONES.find(z => z.id === selectedZone)?.name}</strong>
                    </span>
                  ) : (
                    <span>
                      Showing all <strong className="text-dark font-bold">{ALL_AREAS.length}</strong> static routes across 8 geographic zones
                    </span>
                  )}
                </div>
                <div className="text-dark/40 italic">
                  Instant client-side filter &bull; Live updates as you type
                </div>
              </div>
            </div>
          </div>

          {/* Directory Content / Grouped Areas */}
          {groupedZones.length === 0 ? (
            /* Friendly "No Results Found" State */
            <div className="bg-white rounded-2xl p-8 sm:p-12 md:p-16 text-center border border-dark/10 shadow-sm max-w-3xl mx-auto my-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-dark mb-3">
                No Results Found for &ldquo;{searchQuery}&rdquo;
              </h2>
              <p className="text-dark/70 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                We couldn&rsquo;t find an exact listing matching your search, but <strong>we cover your location!</strong> Our 24/7 towing fleet operates nationwide across all 16 regions of Ghana, including unlisted towns and off-highway roads. Contact our dispatch team directly for immediate assistance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <a 
                  href={safePhoneTel} 
                  className="flex items-center justify-center gap-2.5 bg-accent hover:bg-accent/90 text-white px-8 py-4 font-bold transition-all shadow-md shadow-accent/25 rounded-full w-full sm:w-auto text-base"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Dispatch: {phoneRaw}</span>
                </a>
                <a 
                  href={safeWhatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-white px-8 py-4 font-bold transition-all shadow-md rounded-full w-full sm:w-auto text-base"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedZone('all'); }}
                className="text-primary hover:text-accent font-bold text-sm inline-flex items-center gap-1.5 transition-colors"
              >
                &larr; View All 261 Service Areas
              </button>
            </div>
          ) : (
            /* Directory Groupings */
            <div className="space-y-10 sm:space-y-12">
              {groupedZones.map((zone) => (
                <section 
                  key={zone.id} 
                  id={zone.id}
                  className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 border border-dark/10 shadow-sm"
                >
                  {/* Category / Zone Heading */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-dark/10">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight">
                          {zone.name}
                        </h2>
                      </div>
                      <p className="text-dark/60 text-xs sm:text-sm mt-1 ml-10.5">
                        {zone.subtitle}
                      </p>
                    </div>

                    <div className="self-start sm:self-auto ml-10.5 sm:ml-0">
                      <span className="inline-block px-3 py-1 bg-slate-100 text-dark/70 font-bold text-xs uppercase tracking-wider rounded-full border border-dark/5">
                        {zone.areas.length} {zone.areas.length === 1 ? 'Route' : 'Routes'}
                      </span>
                    </div>
                  </div>

                  {/* Area Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                    {zone.areas.map((area) => (
                      <Link 
                        key={area.path}
                        to={area.path} 
                        className="bg-slate-50 hover:bg-primary/5 p-4 sm:p-4.5 rounded-xl border border-dark/10 hover:border-primary/40 transition-all duration-200 group flex items-center justify-between shadow-2xs hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="min-w-0 pr-3">
                          <span className="block font-bold text-dark group-hover:text-primary transition-colors text-sm sm:text-base leading-snug">
                            {area.label}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-dark/50 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                            <span className="truncate">{area.region}</span>
                          </span>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-white group-hover:bg-primary group-hover:text-white flex items-center justify-center border border-dark/10 group-hover:border-primary transition-all shrink-0">
                          <ArrowRight className="w-4 h-4 text-dark/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Bottom Assistance Banner */}
          <div className="mt-12 md:mt-16 bg-dark text-white rounded-2xl p-6 sm:p-10 md:p-12 text-center relative overflow-hidden border border-white/10 shadow-xl">
            <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-block px-3.5 py-1 bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-full mb-3">
                {ctaBadge}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                {ctaHeading}
              </h2>
              <p className="text-white/80 text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
                {ctaDescription}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href={safePhoneTel} 
                  className="bg-accent hover:bg-accent/90 text-white px-8 py-4 font-bold transition-all shadow-lg shadow-accent/25 rounded-full w-full sm:w-auto text-base flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call {phoneRaw}</span>
                </a>
                <a 
                  href={safeWhatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 font-bold transition-all shadow-lg rounded-full w-full sm:w-auto text-base flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
