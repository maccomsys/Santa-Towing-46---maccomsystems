import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Paintbrush, ShieldCheck, FileText, CheckCircle2, Droplet, 
  Sparkles, Wrench, Clock, ChevronDown, Star,
  MoveRight, Hexagon, Shield, AlertTriangle, Phone, MessageCircle
} from 'lucide-react';
import ScrollToFooterArrow from '@/components/ui/ScrollToFooterArrow';
import { cn } from '@/lib/utils';
import SEO from '@/components/seo/SEO';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { useContent } from '@/hooks/useContent';
import EditableText from '@/components/editable/EditableText';
import {
  brakePartsDiskMaintenance,
  tyreMaintenance,
  filtersMaintenance,
  suspensionPartsMaintenance,
  carLightingMaintenance,
  autoAccessories,
} from '@/assets/images';
import { sanitizeHttpUrl, sanitizeTelUrl } from '@/lib/security';
import { buildFaqSchema, buildServiceSchema } from '@/lib/seoSchemas';

const BODY_SERVICES = [
  { icon: Sparkles, title: 'Dent & Scratch Repair', desc: 'Seamless removal of dents, dings, and scratches without affecting original paint.' },
  { icon: Paintbrush, title: 'Full Spray Painting', desc: 'Complete car resprays using premium automotive paints for a factory finish.' },
  { icon: Wrench, title: 'Panel Beating', desc: 'Expert reshaping and repair of damaged body panels to their original form.' },
  { icon: Shield, title: 'Rust Treatment & Restoration', desc: 'Comprehensive rust removal, treatment, and classic car body restoration.' },
  { icon: Hexagon, title: 'Bumper Repair', desc: 'Plastic welding and repair for cracked, scuffed, or detached bumpers.' },
  { icon: AlertTriangle, title: 'Accident Damage Repair', desc: 'Major structural repairs and realignment after collisions.' },
  { icon: Droplet, title: 'Detailing & Polishing', desc: 'Deep cut and polish services to restore shine and protect your paintwork.' },
];

const WHY_CHOOSE_US = [
  { title: 'Skilled Panel Beaters', icon: Wrench },
  { title: 'Premium Paint Matching', icon: Paintbrush },
  { title: 'Insurance Assistance', icon: FileText },
  { title: 'Quality Guarantee', icon: ShieldCheck },
  { title: 'Fast Turnaround', icon: Clock },
  { title: 'Genuine Materials', icon: CheckCircle2 },
];

const HOW_IT_WORKS = [
  'Car Assessment', 'Detailed Quote', 'Approval', 'Repair & Repainting', 'Quality Inspection', 'Car Handover'
];

const FINISH_OPTIONS = [
  { name: 'Gloss Finish', desc: 'The classic, high-shine reflective finish.', color: 'bg-gradient-to-br from-red-600 to-red-800' },
  { name: 'Matte Finish', desc: 'A modern, flat finish that absorbs light.', color: 'bg-dark' },
  { name: 'Metallic Finish', desc: 'Contains metal flakes for a sparkling effect.', color: 'bg-gradient-to-br from-blue-400 to-blue-700' },
  { name: 'Pearl Finish', desc: 'Shimmers and changes color depending on the angle.', color: 'bg-gradient-to-br from-purple-400 to-pink-500' },
];

const BODY_FAQS = [
  { q: 'How long will the repair and painting take?', a: 'Minor scratch and dent repairs usually take 1-2 days. Full spray painting or major accident damage can take anywhere from 1 to 3 weeks depending on the extent of the work and parts availability.' },
  { q: 'Can you match the exact original color of my car?', a: 'Yes! We use advanced computerized paint matching technology and premium paints to ensure a 100% seamless color match with your car\'s factory finish.' },
  { q: 'Do you work with my insurance company?', a: 'Absolutely. We assist with the entire claims process, provide detailed estimates for your insurer, and offer direct billing where applicable.' },
  { q: 'Do you offer a warranty on the paintwork?', a: 'Yes, all our spray painting and bodywork come with a minimum 1-year guarantee against peeling, fading, or cracking under normal conditions.' },
  { q: 'How do I get a cost estimate?', a: 'You can bring your car to our workshop for a free physical assessment, or send us clear photos of the damage via WhatsApp for a preliminary estimate.' },
];

export default function BodyWorks() {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [activeBeforeAfter, setActiveBeforeAfter] = useState(0);

  const phoneRaw = useContent('global.links.phone', '0244753849');
  const phoneTel = useContent('global.links.phoneTel', 'tel:0244753849');
  const whatsapp = useContent('global.links.whatsapp', 'https://wa.me/233244753849');
  const safePhoneTel = sanitizeTelUrl(phoneTel || `tel:${phoneRaw}`);
  const safeWhatsapp = sanitizeHttpUrl(whatsapp, 'https://wa.me/233244753849');
  const whatsappJoinChar = safeWhatsapp.includes('?') ? '&' : '?';
  const bodyWorksTitle = useContent('bodyWorks.title', 'Body Works, Dent Repair & Spray Painting');
  const bodyWorksDesc = useContent('bodyWorks.description', 'Factory-grade spray booth painting, computerized frame alignment, collision repair, and scratch restoration.');

  const beforeAfterImages = [
    {
      before: brakePartsDiskMaintenance,
      after: tyreMaintenance,
      title: 'Front Bumper Restoration'
    },
    {
      before: filtersMaintenance,
      after: suspensionPartsMaintenance,
      title: 'Full Body Respray'
    }
  ];

  return (
    <main className="pt-24 lg:pt-[104px] min-h-screen">
      <SEO
        title="Auto Body Works & Spray Painting | Santa Towing"
        description="Professional dent repair, panel beating, collision restoration, and oven-baked spray painting in Ghana to restore your car to factory condition."
        canonical="/body-works"
        image={carLightingMaintenance}
        imageAlt="Auto body works, dent repair, and spray painting booth at Santa Towing"
        keywords={[
          'auto body works Ghana',
          'car spray painting Accra',
          'collision repair Ghana',
          'dent removal Accra',
          'panel beating workshop Ghana',
        ]}
        schema={[
          buildServiceSchema({
            name: 'Auto Body Works, Collision Repair & Spray Painting',
            description:
              'Precision panel beating, dent removal, and computerized factory-finish spray painting in Ghana.',
            path: '/body-works',
            serviceType: 'Automotive Body Repair & Painting',
          }),
          buildFaqSchema(BODY_FAQS),
        ]}
      />
      <div className="bg-white border-b border-dark/10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Body Works' }]} />
        </div>
      </div>
      
      {/* 1. Hero Banner */}
      <section className="relative bg-primary overflow-hidden pt-12 pb-32 md:pt-20 md:pb-40">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${carLightingMaintenance})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            <EditableText
              storageKey="bodyWorks.hero.title"
              defaultContent={bodyWorksTitle}
              label="Body Works Hero Title"
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
              storageKey="bodyWorks.hero.desc"
              defaultContent={bodyWorksDesc}
              label="Body Works Hero Description"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a href={safePhoneTel} className="bg-accent hover:bg-accent/90 text-white px-4 sm:px-8 py-4 font-bold transition-all shadow-lg shadow-accent/30 rounded-full flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Call for Assessment
            </a>
            <a href={safeWhatsapp} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 sm:px-8 py-4 font-bold transition-all border border-white/20 rounded-full flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
          </motion.div>
        </div>
      
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 ">
          <ScrollToFooterArrow />
        </div>
      </section>

      {/* 2. Body Works Services Grid */}
      <section className="py-16 md:py-24 bg-white relative -mt-16 rounded-t-[1px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">Our Services</h2>
            <p className="text-dark/70 text-lg">Precision craftsmanship for every panel and curve.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {BODY_SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 sm:p-8 rounded-[1px] shadow-sm border border-dark/10 hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                    <Icon className="w-7 h-7 text-white group-hover:text-secondary transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-3">{service.title}</h3>
                  <p className="text-dark/70 flex-1 text-sm">{service.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Our Craftsmanship (Before & After Gallery) */}
      <section className="py-16 md:py-24 bg-primary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Our Craftsmanship</h2>
            <p className="text-white/80 text-lg">Witness the stunning transformations.</p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-[1px] p-4 sm:p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{beforeAfterImages[activeBeforeAfter].title}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveBeforeAfter(prev => (prev === 0 ? beforeAfterImages.length - 1 : prev - 1))}
                    className="w-10 h-10 bg-white/10 hover:bg-accent text-white flex items-center justify-center transition-colors"
                  >
                    &larr;
                  </button>
                  <button 
                    onClick={() => setActiveBeforeAfter(prev => (prev === beforeAfterImages.length - 1 ? 0 : prev + 1))}
                    className="w-10 h-10 bg-white/10 hover:bg-accent text-white flex items-center justify-center transition-colors"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 md:gap-8 relative">
                <div className="relative rounded-[1px] overflow-hidden aspect-[4/3]">
                  <img src={beforeAfterImages[activeBeforeAfter].before} alt={`${beforeAfterImages[activeBeforeAfter].title} before body work restoration`} className="w-full h-full object-cover grayscale" loading="lazy" decoding="async" />
                  <div className="absolute top-4 left-4 bg-primary/80 text-white px-4 py-1.5 rounded-xl text-sm font-bold backdrop-blur-md">
                    Before
                  </div>
                </div>
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-accent text-white rounded-xl items-center justify-center z-10 shadow-xl border-4 border-dark">
                  <MoveRight className="w-5 h-5" />
                </div>
                <div className="relative rounded-[1px] overflow-hidden aspect-[4/3]">
                  <img src={beforeAfterImages[activeBeforeAfter].after} alt={`${beforeAfterImages[activeBeforeAfter].title} after spray painting and restoration`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  <div className="absolute top-4 right-4 bg-accent text-white px-4 py-1.5 rounded-[1px] text-sm font-bold shadow-md">
                    After
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Our Body Shop */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">Why Choose Us</h2>
            <p className="text-dark/70 text-lg">Uncompromising quality and attention to detail.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {WHY_CHOOSE_US.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-dark/10 rounded-[1px] p-6 text-center hover:shadow-md transition-shadow group"
                >
                  <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm text-white group-hover:bg-white group-hover:text-secondary transition-colors">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-dark">{feature.title}</h3>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">Our Restoration Process</h2>
            <p className="text-dark/70 text-lg">A systematic approach to bringing your car back to life.</p>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-dark/10 -translate-y-1/2" />
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {HOW_IT_WORKS.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 bg-white rounded-xl border-4 border-dark/10 shadow-md flex items-center justify-center font-bold text-dark group-hover:border-accent group-hover:text-accent transition-colors relative z-10 mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-dark text-sm leading-tight">{step}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Insurance Claims Support */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-[1px] p-6 sm:p-8 md:p-12 overflow-hidden relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="md:w-1/2 relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Insurance Claims Support</h2>
              <p className="text-white/70 text-lg mb-8">
                Dealing with an accident is stressful enough. We help streamline the process by assisting with insurance documentation, providing detailed damage assessments, and offering direct billing with major insurance providers.
              </p>
              <a
                href={`${safeWhatsapp}${whatsappJoinChar}text=${encodeURIComponent('Hello Santa Towing, I need assistance with an insurance body repair claim.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent hover:bg-accent/90 text-white font-bold px-4 sm:px-8 py-4 transition-all shadow-md rounded-full inline-block"
              >
                Get Help With Your Claim
              </a>
            </div>
            <div className="md:w-1/2 relative z-10 w-full">
              <div className="aspect-video rounded-[1px] overflow-hidden bg-white/5 border border-white/10">
                <img src={autoAccessories} alt="Insurance body repair documentation and vehicle inspection support" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" loading="lazy" decoding="async" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Color & Finish Options */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-dark mb-4">Color & Finish Options</h2>
            <p className="text-dark/70 text-lg">Choose the perfect look for your car.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FINISH_OPTIONS.map((finish, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[1px] p-6 shadow-sm border border-dark/10 group hover:border-accent/30 transition-colors"
              >
                <div className={cn("w-full aspect-square rounded-xl mb-6 shadow-inner", finish.color)} />
                <h3 className="text-xl font-bold text-dark mb-2">{finish.name}</h3>
                <p className="text-sm text-dark/70">{finish.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* 9. FAQs */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">
              Body Works FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {BODY_FAQS.map((faq, idx) => (
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

      {/* 10. Call-to-Action Banner */}
      <section className="py-16 md:py-24 bg-primary text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.5) 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Give Your Car the Finish It Deserves</h2>
          <p className="text-lg md:text-xl mb-10 text-white/90">
            Call for an assessment today and let our experts restore your car's beauty and value.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={safePhoneTel} className="bg-accent hover:bg-accent/90 text-white px-4 sm:px-8 py-4 font-bold transition-all shadow-xl rounded-full flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" /> Call for Assessment
            </a>
            <a href={safeWhatsapp} target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-dark/5 text-dark px-4 sm:px-8 py-4 font-bold transition-all shadow-xl rounded-full flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
