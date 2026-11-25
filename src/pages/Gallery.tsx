import React, { useState, useRef, useEffect } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  X, ChevronLeft, ChevronRight, Play, Camera, 
  Phone, ArrowRight, Instagram
} from 'lucide-react';
import ScrollToFooterArrow from '@/components/ui/ScrollToFooterArrow';
import { cn } from '@/lib/utils';
import SEO from '@/components/seo/SEO';
import { useContent } from '@/hooks/useContent';
import { useInventoryGallery } from '@/hooks/useInventory';
import {
  sedanToyotaCorolla,
  heavyDutyRecoveryVehicle,
  vanHyundaiH12022,
  luxuryMercedesBenz,
  suvKiaSportage2024,
  economyNissanAlmera2021,
  towingVehicleFlatbed,
  pickupToyotaHilux2023,
  engineOilFluidsMaintenance,
  carBatteryMaintenance,
  brakePartsDiskMaintenance,
} from '@/assets/images';
import { sanitizeHttpUrl, sanitizeImageUrl, sanitizeTelUrl } from '@/lib/security';
import { buildServiceSchema } from '@/lib/seoSchemas';

const CATEGORIES = [
  'All', 'Towing Fleet', 'Workshop', 'Body Works', 'Rental Fleet', 'Car Sales', 'Team & Facilities'
];

const VIDEOS = [
  { id: 1, title: 'Inside Our Advanced Workshop', thumb: vanHyundaiH12022, duration: '2:45' },
  { id: 2, title: 'Emergency Towing Operation', thumb: towingVehicleFlatbed, duration: '1:30' },
  { id: 3, title: 'Body Works Transformation', thumb: pickupToyotaHilux2023, duration: '3:10' },
];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideo, setActiveVideo] = useState<(typeof VIDEOS)[number] | null>(null);
  
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { galleryItems } = useInventoryGallery();
  const filteredImages = activeCategory === 'All' 
    ? galleryItems 
    : galleryItems.filter(img => img.category === activeCategory);

  const handleSliderMove = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    let clientX = 0;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
    } else {
      clientX = (event as React.MouseEvent | MouseEvent).clientX;
    }
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => handleSliderMove(e);
    const handleTouchMove = (e: TouchEvent) => handleSliderMove(e);
    
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
    }
    
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };
  const prevLightbox = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        setActiveVideo(null);
      } else if (lightboxIndex !== null && filteredImages.length > 0) {
        if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredImages.length : null));
        } else if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredImages.length]);

  const seoTitle = useContent('seo.gallery.title', 'Our Work Gallery | Towing & Auto Repairs | Santa Towing');
  const seoDesc = useContent('seo.gallery.description', 'View our gallery showcasing successful car recoveries, auto body restorations, repair works, and our premium rental fleet.');
  const galleryDesc = useContent('gallery.description', 'A visual look at our towing fleet, workshop facilities, car inventory, and completed repairs. Quality you can see.');
  const heroImage = useContent('gallery.heroImage', heavyDutyRecoveryVehicle);
  const beforeImage = useContent('gallery.beforeImage', engineOilFluidsMaintenance);
  const afterImage = useContent('gallery.afterImage', carBatteryMaintenance);
  const instagramUrl = useContent('global.social.instagram', 'https://instagram.com/santatowing');
  const phoneTel = useContent('global.links.phoneTel', 'tel:0244753849');
  const safeHeroImage = sanitizeImageUrl(heroImage, heavyDutyRecoveryVehicle);
  const safeBeforeImage = sanitizeImageUrl(beforeImage, engineOilFluidsMaintenance);
  const safeAfterImage = sanitizeImageUrl(afterImage, carBatteryMaintenance);
  const safeInstagramUrl = sanitizeHttpUrl(instagramUrl, 'https://instagram.com/santatowing');
  const safePhoneTel = sanitizeTelUrl(phoneTel);

  return (
    <main className="pt-24 lg:pt-[104px] min-h-screen bg-white">
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords="Santa Towing gallery, auto body repair transformations Ghana, towing fleet photos, Accra car workshop"
        canonical="/gallery"
        image={safeHeroImage}
        imageAlt="Santa Towing fleet, body works, and auto repair workshop gallery in Ghana"
        schema={buildServiceSchema({
          name: 'Santa Towing Work & Fleet Gallery',
          description: seoDesc,
          path: '/gallery',
          serviceType: 'Automotive Towing & Repair Portfolio',
        })}
      />
      
      {/* 1. Hero Banner */}
      <section className="relative bg-primary text-white py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent z-10" />
          <img 
            src={safeHeroImage} 
            alt="Santa Towing recovery fleet and workshop operations in Ghana" 
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 text-center md:text-left">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            See Our Work <span className="text-accent">in Action</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/70 max-w-2xl leading-relaxed mb-8 mx-auto md:mx-0"
          >
            {galleryDesc}
          </motion.p>
        </div>
      
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 ">
          <ScrollToFooterArrow />
        </div>
      </section>

      {/* 2. Category Filter */}
      <section className="pt-6 sm:pt-8 pb-5 sm:pb-6 sticky top-[68px] md:top-[72px] z-30 bg-white/95 backdrop-blur-sm border-b border-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'Media Gallery' }]} />
          </div>
          <div className="flex overflow-x-auto no-scrollbar py-2 gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-6 py-2.5 rounded-md text-sm font-bold whitespace-nowrap transition-all",
                  activeCategory === category 
                    ? "bg-primary text-white shadow-md" 
                    : "bg-white border border-dark/20 text-dark/70 hover:border-accent hover:text-accent"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Masonry/Grid Gallery */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px]">
            <AnimatePresence>
              {filteredImages.map((image, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={image.id}
                  className={cn(
                    "relative group rounded-xl overflow-hidden cursor-pointer",
                    (image.span || '').replace(/\bcol-span-(\d+)/g, 'md:col-span-$1').replace(/\brow-span-(\d+)/g, 'md:row-span-$1')
                  )}
                  onClick={() => openLightbox(idx)}
                >
                  <img 
                    src={sanitizeImageUrl(image.url, heavyDutyRecoveryVehicle)} 
                    alt={`${image.title} - ${image.category} at Santa Towing`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 self-start mb-2 rounded-full">
                      {image.category}
                    </span>
                    <h2 className="text-white font-bold text-lg leading-tight flex items-center justify-between">
                      {image.title}
                      <Camera className="w-5 h-5 opacity-70" />
                    </h2>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button 
              type="button"
              aria-label="Close lightbox"
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full z-20"
            >
              <X className="w-6 h-6" />
            </button>
            
            <button 
              type="button"
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-dark/50 sm:bg-white/10 hover:bg-accent p-2 sm:p-3 rounded-full z-20"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            
            <div className="max-w-5xl max-h-[80vh] relative px-10 sm:px-0" onClick={(e) => e.stopPropagation()}>
              <img 
                src={sanitizeImageUrl(filteredImages[lightboxIndex].url, heavyDutyRecoveryVehicle)} 
                alt={`${filteredImages[lightboxIndex].title} - ${filteredImages[lightboxIndex].category}`} 
                decoding="async"
                className="max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-[1px] shadow-2xl mx-auto"
              />
              <div className="p-4 sm:p-6 bg-gradient-to-t from-primary/90 via-primary/70 to-transparent rounded-b-[1px] text-center">
                <span className="text-accent font-bold text-xs sm:text-sm uppercase tracking-wider block mb-1">
                  {filteredImages[lightboxIndex].category}
                </span>
                <h2 className="text-white text-base sm:text-xl md:text-2xl font-bold">
                  {filteredImages[lightboxIndex].title}
                </h2>
              </div>
            </div>

            <button 
              type="button"
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors bg-dark/50 sm:bg-white/10 hover:bg-accent p-2 sm:p-3 rounded-full z-20"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium">
              {lightboxIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Before & After Slider */}
      <section className="py-12 md:py-20 bg-primary text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-12">
            <span className="text-accent font-bold tracking-wider uppercase text-sm mb-2 block">Body Works</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transformations</h2>
            <p className="text-white/80 max-w-2xl mx-auto">Slide to see the incredible results our expert body repair and painting team achieves.</p>
          </div>
          
          <div 
            ref={sliderRef}
            className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-[1px] overflow-hidden cursor-ew-resize select-none touch-none shadow-2xl"
            onMouseDown={(e) => { setIsDragging(true); handleSliderMove(e); }}
            onTouchStart={(e) => { setIsDragging(true); handleSliderMove(e); }}
          >
            {/* After Image (Background) */}
            <img 
              src={safeAfterImage} 
              alt="Completed auto body repair and paint restoration at Santa Towing" 
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              draggable="false"
            />
            
            {/* Before Image (Foreground, clipped without distortion) */}
            <div 
              className="absolute inset-0 z-10 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img 
                src={safeBeforeImage} 
                alt="Damaged vehicle before body work repair at Santa Towing" 
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                draggable="false"
              />
              <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-[1px] shadow-lg">
                Before
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-[1px] shadow-lg z-20">
              After
            </div>

            {/* Vertical Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-25 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            />

            {/* Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 z-30 flex items-center justify-center -ml-4 w-8"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 bg-white rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center border border-dark/20">
                <div className="flex gap-0.5 text-dark">
                  <ChevronLeft className="w-3 h-3" />
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Video Highlights */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Video Highlights</h2>
              <p className="text-dark/70 max-w-2xl">Take a closer look at our operations, from the workshop floor to emergency roadside assistance.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {VIDEOS.map((video) => (
              <button
                type="button"
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="group relative rounded-[1px] overflow-hidden aspect-video bg-white cursor-pointer shadow-sm hover:shadow-xl transition-all border border-dark/10 text-left w-full"
              >
                <img src={video.thumb} alt={`${video.title} video highlight`} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/10 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm text-primary rounded-xl flex items-center justify-center shadow-lg group-hover:bg-accent group-hover:text-white transition-all duration-300 group-hover:scale-110">
                    <Play className="w-6 h-6 ml-1 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <h3 className="font-bold text-white text-lg drop-shadow-md leading-tight max-w-[70%]">{video.title}</h3>
                  <span className="bg-primary/80 backdrop-blur-md text-white text-xs font-bold px-2 py-1 flex items-center gap-1 rounded-full">
                    <Play className="w-3 h-3" /> {video.duration}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Video Highlight Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[1px] max-w-2xl w-full overflow-hidden shadow-2xl border border-dark/10"
            >
              <div className="relative aspect-video bg-primary">
                <img src={activeVideo.thumb} alt={activeVideo.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                <button
                  type="button"
                  aria-label="Close video preview"
                  onClick={() => setActiveVideo(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/15 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                      Highlight Reel &bull; {activeVideo.duration}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white">{activeVideo.title}</h2>
                  </div>
                </div>
              </div>
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-dark/70">
                  See how our certified operators and workshop technicians deliver fast, damage-free service across Ghana.
                </p>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link
                    to="/contact"
                    onClick={() => setActiveVideo(null)}
                    className="bg-primary hover:bg-black text-white px-5 py-2.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap"
                  >
                    Book a Service
                  </Link>
                  <a
                    href={safePhoneTel}
                    className="border border-dark/20 hover:bg-dark/5 text-dark px-5 py-2.5 text-sm font-bold rounded-full transition-colors whitespace-nowrap"
                  >
                    Call Dispatch
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Instagram Feed Integration */}
      <section className="py-12 md:py-20 bg-white border-t border-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
              <Instagram className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">Follow Us on Instagram</h2>
            <p className="text-dark/70 mb-6 max-w-lg mx-auto">Stay updated with our latest projects, behind-the-scenes looks, and daily automotive content.</p>
            <a href={safeInstagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold text-accent hover:text-accent transition-colors">
              @santatowing <ArrowRight className="w-4 h-4" />
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <a
                key={i}
                href={safeInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View Santa Towing Instagram highlight ${i}`}
                className="aspect-square bg-white rounded-[1px] overflow-hidden relative group block"
              >
                <img 
                  src={brakePartsDiskMaintenance} 
                  alt={`Santa Towing automotive workshop Instagram highlight ${i}`} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Call-to-Action Banner */}
      <section className="py-12 md:py-20 bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Our Service Firsthand?</h2>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
            Our visual gallery is just a glimpse of what we do. Call for service today and see our dedication to quality for yourself.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="bg-accent hover:bg-accent/90 text-white px-4 sm:px-8 py-4 font-bold transition-all shadow-xl text-lg inline-block rounded-full">
              Book a Service
            </Link>
            <Link to="/contact" className="bg-white hover:bg-dark/5 text-dark px-4 sm:px-8 py-4 font-bold transition-all shadow-xl text-lg flex items-center gap-2 rounded-full">
              <Phone className="w-5 h-5" /> Contact Us
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
