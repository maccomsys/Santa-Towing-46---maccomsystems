import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { 
  ChevronRight, Calendar, MapPin, Fuel, Settings, ShieldCheck, FileText, CheckCircle2, 
  Heart, Share2, Phone, MessageCircle, ArrowRight, ChevronDown, Star, Car, Calculator,
  Clock, Award, Shield, Check, Info, AlertCircle, Eye, Sparkles, Send, X, CheckCircle, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SEO from '@/components/seo/SEO';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useContent } from '@/hooks/useContent';
import { useInventoryRentals } from '@/hooks/useInventory';
import {
  sedanToyotaCorolla,
  suvKiaSportage2024,
  pickupToyotaHilux2023,
  luxuryMercedesBenz,
  vanHyundaiH12022,
  economyNissanAlmera2021,
} from '@/assets/images';
import { sanitizeTelUrl, sanitizeHttpUrl, sanitizeImageUrl, isValidPhone } from '@/lib/security';
import { buildFaqSchema, buildProductSchema } from '@/lib/seoSchemas';

const RENTAL_SPECS_DATA = {
  features: [
    'Comprehensive Fleet Insurance Coverage',
    'Unlimited Mileage within Greater Accra Metropolitan Area',
    'Optional Professional Uniformed Chauffeur / Driver',
    'Full Air Conditioning & Climate Control',
    'Bluetooth Audio & Hands-Free Connectivity',
    '24/7 Nationwide Emergency Roadside Assistance & Breakdown Replacement',
    'Clean, Sanitized & Full Tank on Pickup',
    'Baby / Child Safety Seat Available on Request'
  ],
  rates: [
    { period: 'Daily Rate (1 - 3 Days)', price: 'GH₵ 850 / day', note: 'Standard daily hire' },
    { period: 'Weekly Rate (4 - 7 Days)', price: 'GH₵ 750 / day', note: 'Save 12%' },
    { period: 'Monthly Corporate Hire (30+ Days)', price: 'GH₵ 600 / day', note: 'Save up to 30%' },
    { period: 'Chauffeur / Driver Allowance', price: 'GH₵ 150 / day', note: 'Professional vetted driver' }
  ]
};

const RENTAL_FAQS = [
  { 
    q: 'What documents are required to rent a car?', 
    a: 'For self-drive rentals, you will need a valid National ID or Passport, a valid Driver’s License (held for at least 2 years), and a refundable security deposit. For chauffeur-driven rentals, only ID is required.' 
  },
  { 
    q: 'Can I take the car outside Greater Accra?', 
    a: 'Yes! Our rental fleet is permitted for travel across all 16 regions of Ghana. Please inform our booking agent in advance if you plan cross-country journeys so we can provide appropriate highway readiness.' 
  },
  { 
    q: 'What is your fuel policy?', 
    a: 'Cars are provided with a full tank of fuel upon handover and should be returned with the same level of fuel. Alternatively, we can refuel for you at standard pump prices.' 
  },
  { 
    q: 'Is insurance included in the rental price?', 
    a: 'Yes, all rental cars come with Comprehensive Motor Insurance. An optional Zero-Excess Collision Damage Waiver (CDW) can be added for extra peace of mind.' 
  }
];

export const RENTAL_FLEET_ITEMS = [
  { id: 1, slug: 'corolla-sedan', categorySlug: 'sedan', name: 'Toyota Corolla 2023', type: 'Sedan', price: 'GH₵ 600 / day', daily: 'GH₵ 600', weekly: 'GH₵ 3,800', monthly: 'GH₵ 14,000', seats: '5 Seats', fuel: 'Petrol', transmission: 'Automatic', image: sedanToyotaCorolla },
  { id: 2, slug: 'sportage-suv', categorySlug: 'suv', name: 'Kia Sportage 2024', type: 'SUV', price: 'GH₵ 900 / day', daily: 'GH₵ 900', weekly: 'GH₵ 5,800', monthly: 'GH₵ 21,000', seats: '5 Seats', fuel: 'Petrol', transmission: 'Automatic', image: suvKiaSportage2024 },
  { id: 3, slug: 'hilux-pickup', categorySlug: 'pickup', name: 'Toyota Hilux 2023 4x4', type: 'Pickup 4x4', price: 'GH₵ 800 / day', daily: 'GH₵ 800', weekly: 'GH₵ 5,000', monthly: 'GH₵ 18,000', seats: '5 Seats', fuel: 'Diesel', transmission: 'Automatic', image: pickupToyotaHilux2023 },
  { id: 4, slug: 'mercedes-luxury', categorySlug: 'luxury', name: 'Mercedes-Benz E-Class', type: 'Luxury Sedan', price: 'GH₵ 1,500 / day', daily: 'GH₵ 1,500', weekly: 'GH₵ 9,500', monthly: 'GH₵ 35,000', seats: '5 Seats', fuel: 'Premium Petrol', transmission: 'Automatic', image: luxuryMercedesBenz },
  { id: 5, slug: 'hyundai-van', categorySlug: 'van', name: 'Hyundai H1 Executive Bus', type: 'Passenger Van', price: 'GH₵ 1,100 / day', daily: 'GH₵ 1,100', weekly: 'GH₵ 7,000', monthly: 'GH₵ 25,000', seats: '12 Seats', fuel: 'Diesel', transmission: 'Manual', image: vanHyundaiH12022 },
  { id: 6, slug: 'nissan-economy', categorySlug: 'economy', name: 'Nissan Almera 2021', type: 'Economy Sedan', price: 'GH₵ 400 / day', daily: 'GH₵ 400', weekly: 'GH₵ 2,500', monthly: 'GH₵ 9,000', seats: '4 Seats', fuel: 'Petrol', transmission: 'Automatic', image: economyNissanAlmera2021 }
];

export default function RentalDetails() {
  const { id } = useParams();
  const { allRentals, getRentalByIdOrSlug } = useInventoryRentals(true);
  
  const phoneRaw = useContent('global.links.phone', '0244753849');
  const phoneTel = useContent('global.links.phoneTel', 'tel:0244753849');
  const whatsapp = useContent('global.links.whatsapp', 'https://wa.me/233244753849');
  const safePhoneTel = sanitizeTelUrl(phoneTel || phoneRaw, 'tel:0244753849');
  const safeWhatsapp = sanitizeHttpUrl(whatsapp, 'https://wa.me/233244753849');
  
  // Find car by ID, slug, or category slug; only fallback to defaults when no ID param is given
  const normalizedId = String(id || '').toLowerCase();
  const matchedRental = id
    ? getRentalByIdOrSlug(id) || RENTAL_FLEET_ITEMS.find(v => 
        String(v.id) === normalizedId ||
        v.slug === normalizedId ||
        v.categorySlug === normalizedId ||
        v.type.toLowerCase().includes(normalizedId)
      )
    : allRentals[0] || RENTAL_FLEET_ITEMS[0];
  const isNotFound = Boolean(id && !matchedRental);
  const car = matchedRental || allRentals[0] || RENTAL_FLEET_ITEMS[0];

  const rentalItem = car as any;
  const formattedSeats = String(car.seats || '5').toLowerCase().includes('seat')
    ? String(car.seats)
    : `${car.seats} Seats`;
  const vehicleFeatures: string[] = (rentalItem.features && rentalItem.features.length > 0)
    ? rentalItem.features
    : RENTAL_SPECS_DATA.features;
  const vehicleRates = [
    { period: 'Daily Rate (1 - 3 Days)', price: car.daily ? `${car.daily} / day` : 'GH₵ 600 / day', note: 'Standard daily hire' },
    { period: 'Weekly Rate (7 Days)', price: car.weekly ? `${car.weekly} / week` : 'GH₵ 3,800 / week', note: 'Discounted weekly package' },
    { period: 'Monthly Corporate Hire (30 Days)', price: car.monthly ? `${car.monthly} / month` : 'GH₵ 14,000 / month', note: 'Best value for long-term hire' },
    { period: 'Chauffeur / Driver Allowance', price: 'GH₵ 150 / day', note: 'Professional vetted driver' }
  ];

  const rawGallery: string[] = (rentalItem.images && rentalItem.images.length > 0)
    ? rentalItem.images.map((img: any) => typeof img === 'string' ? img : img.url)
    : [
        car.image,
        luxuryMercedesBenz,
        sedanToyotaCorolla,
        suvKiaSportage2024
      ];
  const sanitizedGallery = rawGallery
    .map((u) => sanitizeImageUrl(u, ''))
    .filter((u): u is string => Boolean(u));
  const galleryImages = sanitizedGallery.length > 0 ? sanitizedGallery : [sedanToyotaCorolla];

  const [activeImage, setActiveImage] = useState<string>(galleryImages[0]);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [withDriver, setWithDriver] = useState(false);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingDuration, setBookingDuration] = useState('1 Day');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    setActiveImage(galleryImages[0]);
    setShowBookingModal(false);
    setBookingSubmitted(false);
    setBookingError('');
    setWithDriver(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, car.id]);

  if (isNotFound) {
    return (
      <main className="pt-24 lg:pt-[104px] bg-slate-50 min-h-screen">
        <SEO title="Rental Vehicle Not Found | Santa Towing" description="The requested rental vehicle could not be found." canonical={`/rental/${id}`} noindex />
        <div className="bg-white border-b border-gray-200/80 py-3.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: 'Car Rental', path: '/rental' }, { label: 'Not Found' }]} />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 shadow-sm">
            <Car className="w-12 h-12 text-accent mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-3">Rental Vehicle Not Found</h1>
            <p className="text-slate-600 mb-6">This rental vehicle is currently unavailable or unlisted.</p>
            <Link to="/rental" className="inline-flex items-center gap-2 bg-primary hover:bg-black text-white font-bold px-6 py-3 rounded-full transition-colors">
              Browse Rental Fleet <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 lg:pt-[104px] bg-slate-50 min-h-screen">
      <SEO 
        title={rentalItem.seoTitle || `${car.name} Rental in Ghana | Santa Towing Car Hire`} 
        description={rentalItem.seoDescription || `Rent ${car.name} in Accra & across Ghana. Affordable daily & weekly rates with chauffeur and self-drive options. 24/7 roadside assistance included.`} 
        keywords={`${car.name} rental Ghana, rent ${car.name} Accra, ${car.type} hire Ghana, Santa Towing car hire`}
        canonical={`/rental/${car.id}`} 
        type="product"
        image={activeImage || car.image}
        imageAlt={`${car.name} (${car.type}) available for rent in Ghana`}
        schema={[
          buildProductSchema({
            name: `${car.name} Rental`,
            description: rentalItem.seoDescription || `Rent ${car.name} in Accra & across Ghana. Daily rate: ${car.daily}.`,
            path: `/rental/${car.id}`,
            image: activeImage || car.image,
            price: car.daily,
            brand: 'Santa Towing Fleet',
          }),
          buildFaqSchema(RENTAL_FAQS),
        ]}
      />

      {/* Top Breadcrumbs */}
      <div className="bg-white border-b border-gray-200/80 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs 
            items={[
              { label: 'Car Rental', path: '/rental' },
              { label: car.type, path: '/rental' },
              { label: car.name }
            ]} 
          />
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 min-w-0 space-y-8">
            
            {/* Gallery */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200/80 shadow-sm space-y-4">
              <div className="aspect-[16/10] relative rounded-lg overflow-hidden bg-slate-100 border border-gray-100">
                <img 
                  src={activeImage} 
                  alt={`${car.name} (${car.type}) rental car in Ghana`} 
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                />
                <div className="absolute top-4 left-4 bg-dark/85 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md">
                  Santa Towing Verified Fleet
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {galleryImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "aspect-video rounded-lg overflow-hidden border-2 transition-all bg-slate-100",
                      activeImage === img ? "border-accent ring-2 ring-accent/30 shadow-md" : "border-transparent opacity-75 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt={`${car.name} rental view ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-slate-500 truncate">Capacity</div>
                  <div className="font-extrabold text-dark text-xs sm:text-base break-words">{formattedSeats}</div>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-slate-500 truncate">Transmission</div>
                  <div className="font-extrabold text-dark text-xs sm:text-base break-words">{car.transmission}</div>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-slate-500 truncate">Fuel</div>
                  <div className="font-extrabold text-dark text-xs sm:text-base break-words">{car.fuel}</div>
                </div>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] sm:text-xs text-slate-500 truncate">Insurance</div>
                  <div className="font-extrabold text-dark text-xs sm:text-base break-words">Full Comprehensive</div>
                </div>
              </div>
            </div>

            {/* Rental Overview & Rates */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-dark mb-3">Rental Inclusions &amp; Benefits</h2>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {vehicleFeatures.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-dark mb-4">Rental Rate Breakdown</h3>
                <div className="space-y-3">
                  {vehicleRates.map((rate, idx) => (
                    <div key={idx} className="flex flex-wrap justify-between items-center gap-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200/60">
                      <div className="min-w-0">
                        <div className="font-bold text-dark text-sm">{rate.period}</div>
                        <div className="text-xs text-slate-500">{rate.note}</div>
                      </div>
                      <div className="font-extrabold text-accent text-base shrink-0">{rate.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rental FAQs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-accent" />
                <span>Car Rental Questions &amp; Guidelines</span>
              </h2>
              <div className="space-y-3">
                {RENTAL_FAQS.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full px-5 py-4 text-left flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-bold text-dark text-sm sm:text-base pr-4">{faq.q}</span>
                        <ChevronDown className={cn("w-5 h-5 text-accent transition-transform shrink-0", isOpen && "rotate-180")} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 pt-1 bg-slate-50/70 text-slate-600 text-sm leading-relaxed border-t border-gray-100">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Sticky Sidebar */}
          <div className="lg:col-span-4 min-w-0">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* Pricing Card */}
              <div className="bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-gray-200 p-6 sm:p-7 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-red-500 to-primary" />
                
                <div className="mb-4">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-dark leading-tight">
                      {car.name}
                    </h1>
                    <button 
                      onClick={() => setIsSaved(!isSaved)}
                      className={cn(
                        "p-2 rounded-full border transition-all duration-200 flex items-center justify-center shrink-0",
                        isSaved ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-slate-50 border-gray-200 text-slate-600 hover:bg-slate-100"
                      )}
                      aria-label="Save rental"
                    >
                      <Heart className={cn("w-4 h-4", isSaved && "fill-rose-600")} />
                    </button>
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Daily Rental Rate
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-accent mt-1 tracking-tight">
                    {car.price}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Includes Comprehensive Insurance</div>
                </div>

                {/* Driver Option Selector */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5">
                  <div className="text-xs font-bold text-dark mb-2">Select Rental Preference:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setWithDriver(false)}
                      className={cn(
                        "py-2 px-3 text-xs font-bold rounded-lg border transition-all",
                        !withDriver ? "bg-accent text-white border-accent shadow-sm" : "bg-white text-dark border-gray-200 hover:bg-slate-100"
                      )}
                    >
                      Self-Drive
                    </button>
                    <button 
                      onClick={() => setWithDriver(true)}
                      className={cn(
                        "py-2 px-3 text-xs font-bold rounded-lg border transition-all",
                        withDriver ? "bg-accent text-white border-accent shadow-sm" : "bg-white text-dark border-gray-200 hover:bg-slate-100"
                      )}
                    >
                      With Chauffeur
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-3">
                  <a 
                    href={safePhoneTel} 
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 px-4 rounded-full transition-all shadow-md flex justify-center items-center gap-2 text-sm sm:text-base"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Hotline for Booking</span>
                  </a>

                  <a 
                    href={`${safeWhatsapp}?text=Hello%20Santa%20Towing,%20I%20would%20like%20to%20reserve%20the%20${encodeURIComponent(car.name)}%20(${withDriver ? 'With Chauffeur' : 'Self-Drive'}).`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 px-4 rounded-full transition-all shadow-md flex justify-center items-center gap-2 text-sm sm:text-base"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp Instant Booking</span>
                  </a>

                  <button 
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-dark font-bold py-3 px-4 rounded-full transition-all flex justify-center items-center gap-2 text-sm"
                  >
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span>Reserve Online</span>
                  </button>
                </div>
              </div>

              {/* Showroom & Pickup Location */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
                <h2 className="font-bold text-dark text-base mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>Fleet Station &amp; Pickup</span>
                </h2>
                <p className="text-xs text-slate-600 mb-3">
                  Airport pickup / drop-off available at Kotoka International Airport (ACC) on request.
                </p>
                <div className="text-xs text-slate-500 font-medium">
                  Main Depot: Spintex Road, Accra • 24/7 Dispatch
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-200 relative"
            >
              <button 
                onClick={() => { setShowBookingModal(false); setBookingSubmitted(false); setBookingError(''); }}
                className="absolute top-5 right-5 text-slate-400 hover:text-dark p-1 rounded-full"
                aria-label="Close reservation modal"
              >
                <X className="w-5 h-5" />
              </button>

              {!bookingSubmitted ? (
                <>
                  <div className="mb-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Rental Reservation</div>
                    <h2 className="text-xl font-bold text-dark">{car.name}</h2>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!bookingName.trim()) {
                        setBookingError('Please enter your full name.');
                        return;
                      }
                      if (!isValidPhone(bookingPhone)) {
                        setBookingError('Please enter a valid phone number (7 to 15 digits).');
                        return;
                      }
                      if (!bookingDate) {
                        setBookingError('Please select a rental start date.');
                        return;
                      }
                      setBookingError('');
                      setBookingSubmitted(true);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-dark mb-1">Full Name</label>
                      <input
                        required
                        type="text"
                        maxLength={80}
                        value={bookingName}
                        onChange={(e) => { setBookingName(e.target.value); if (bookingError) setBookingError(''); }}
                        placeholder="Your name"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-dark mb-1">Phone / WhatsApp</label>
                      <input
                        required
                        type="tel"
                        maxLength={25}
                        value={bookingPhone}
                        onChange={(e) => { setBookingPhone(e.target.value); if (bookingError) setBookingError(''); }}
                        placeholder="e.g. 0244 000 000"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label className="block text-xs font-bold text-dark mb-1">Start Date</label>
                        <input
                          required
                          type="date"
                          value={bookingDate}
                          onChange={(e) => { setBookingDate(e.target.value); if (bookingError) setBookingError(''); }}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-dark mb-1">Rental Duration</label>
                        <select
                          value={bookingDuration}
                          onChange={(e) => setBookingDuration(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-accent bg-white"
                        >
                          <option>1 Day</option>
                          <option>2 - 3 Days</option>
                          <option>1 Week</option>
                          <option>1 Month+</option>
                        </select>
                      </div>
                    </div>
                    {bookingError && (
                      <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {bookingError}
                      </p>
                    )}
                    <button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 px-6 rounded-full shadow-md text-sm mt-2">
                      Submit Reservation Request
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-dark">Reservation Request Sent!</h2>
                  <p className="text-sm text-slate-600">
                    Our rental reservations desk will contact you via phone/WhatsApp immediately to confirm car availability.
                  </p>
                  <button 
                    onClick={() => {
                      setShowBookingModal(false);
                      setBookingSubmitted(false);
                      setBookingName('');
                      setBookingPhone('');
                      setBookingDate('');
                      setBookingError('');
                    }}
                    className="bg-primary text-white font-bold px-6 py-2.5 rounded-full text-sm hover:bg-primary/90"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
