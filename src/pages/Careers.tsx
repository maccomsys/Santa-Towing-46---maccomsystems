import React, { useState, useRef, useEffect } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, GraduationCap, Wrench, Users, ShieldCheck, Award, 
  MapPin, Clock, ChevronRight, CheckCircle2, Search, ArrowRight, X, Paperclip, Send
} from 'lucide-react';
import ScrollToFooterArrow from '@/components/ui/ScrollToFooterArrow';
import { cn } from '@/lib/utils';
import SEO from '@/components/seo/SEO';
import { useContent } from '@/hooks/useContent';
import { useInventoryCareers } from '@/hooks/useInventory';
import {
  filtersMaintenance,
  suspensionPartsMaintenance,
  carLightingMaintenance,
} from '@/assets/images';
import { isValidEmail, isValidPhone, sanitizeHttpUrl, sanitizeImageUrl } from '@/lib/security';

const PERKS = [
  { icon: Award, title: 'Competitive Pay', desc: 'Industry-leading compensation packages and performance bonuses.' },
  { icon: GraduationCap, title: 'Career Growth', desc: 'Continuous training and pathways for advancement within the company.' },
  { icon: Wrench, title: 'Modern Equipment', desc: 'Work with the latest diagnostic tools and state-of-the-art facilities.' },
  { icon: Users, title: 'Supportive Culture', desc: 'A collaborative, inclusive team environment that values every member.' },
  { icon: ShieldCheck, title: 'Health & Safety', desc: 'Rigorous safety standards and comprehensive health benefits.' },
  { icon: Briefcase, title: 'Employee Recognition', desc: 'Regular acknowledgment and rewards for outstanding performance.' },
];

const DEPARTMENTS = ['All', 'Towing & Recovery', 'Auto Repair', 'Body Works', 'Sales', 'Customer Support', 'Administration'];

const PROCESS_STEPS = [
  { title: 'Submit Application', desc: 'Apply online with your updated resume and cover letter.' },
  { title: 'Initial Screening', desc: 'Our HR team reviews applications and schedules a brief phone call.' },
  { title: 'Interview', desc: 'Meet with the hiring manager to discuss your experience and fit.' },
  { title: 'Skills Assessment', desc: 'Practical test or technical discussion (role dependent).' },
  { title: 'Offer & Onboarding', desc: 'Receive your offer and begin your journey with our team.' },
];

export default function Careers() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedJobId, setExpandedJobId] = useState<string | number | null>(null);
  const [isApplyingFor, setIsApplyingFor] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const submitTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) window.clearTimeout(submitTimerRef.current);
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const { careers } = useInventoryCareers();
  const openJobs = careers.filter(job => job.status !== 'Closed' && job.status !== 'Draft');
  const filteredJobs = activeFilter === 'All' 
    ? openJobs 
    : openJobs.filter(job => job.department === activeFilter);

  const validateAndSetResume = (file: File | null) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setResumeError('Please upload a PDF, DOC, or DOCX file.');
      setResumeFile(null);
      return;
    }
    if (file.size <= 0) {
      setResumeError('Selected file appears to be empty.');
      setResumeFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('File size must be 5MB or less.');
      setResumeFile(null);
      return;
    }
    setResumeError(null);
    setResumeFile(file);
  };

  const resetApplicationState = () => {
    setResumeFile(null);
    setResumeError(null);
    setApplicationError(null);
    setIsDraggingResume(false);
    setApplicationSuccess(false);
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApplicationError(null);
    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const fullName = String(data.get('fullName') || '').trim();
    const email = String(data.get('email') || '').trim();
    const phone = String(data.get('phone') || '').trim();
    const portfolioUrl = String(data.get('portfolioUrl') || '').trim();

    if (!fullName || fullName.length > 100) {
      setApplicationError('Please enter your full name (max 100 characters).');
      return;
    }
    if (!isValidEmail(email)) {
      setApplicationError('Please enter a valid email address.');
      return;
    }
    if (!isValidPhone(phone)) {
      setApplicationError('Please enter a valid phone number (7 to 15 digits).');
      return;
    }
    if (portfolioUrl && !sanitizeHttpUrl(portfolioUrl, '')) {
      setApplicationError('Portfolio / LinkedIn URL must start with http:// or https://.');
      return;
    }
    if (!resumeFile) {
      setResumeError('Please attach your resume or CV before submitting.');
      return;
    }
    if (resumeFile.size <= 0 || resumeFile.size > 5 * 1024 * 1024) {
      setResumeError('Resume file must be between 1 byte and 5MB.');
      return;
    }

    setIsSubmitting(true);
    if (submitTimerRef.current) window.clearTimeout(submitTimerRef.current);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    submitTimerRef.current = window.setTimeout(() => {
      setIsSubmitting(false);
      setApplicationSuccess(true);
      formEl.reset();
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      closeTimerRef.current = window.setTimeout(() => {
        setApplicationSuccess(false);
        setIsApplyingFor(null);
      }, 3000);
    }, 1000);
  };

  const scrollToJobs = () => {
    document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' });
  };

  const seoTitle = useContent('seo.careers.title', 'Careers | Join the Santa Towing Team');
  const seoDesc = useContent('seo.careers.description', 'Explore exciting career opportunities for mechanics, tow truck operators, and administrative staff at Santa Towing.');
  const badge = useContent('careers.badge', 'Careers');
  const description = useContent('careers.description', "Join a team driven by excellence, innovation, and a passion for automotive service. We're looking for dedicated professionals to grow with us.");
  const heroImage = useContent('careers.heroImage', filtersMaintenance);
  const safeHeroImage = sanitizeImageUrl(heroImage, filtersMaintenance);

  return (
    <main className="pt-24 lg:pt-[104px] min-h-screen bg-white">
      <SEO
        title={seoTitle}
        description={seoDesc}
        keywords="careers at Santa Towing, mechanic jobs Accra, tow truck driver jobs Ghana, automotive technician careers"
        canonical="/careers"
        image={safeHeroImage}
        imageAlt="Automotive careers and workshop openings at Santa Towing Ghana"
      />
      
      {/* 1. Hero Banner */}
      <section className="relative bg-primary text-white py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/40 z-10" />
          <img 
            src={safeHeroImage} 
            alt="Santa Towing auto workshop technicians and team in Ghana" 
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="mb-6">
            <Breadcrumbs items={[{ label: 'Careers' }]} variant="light" />
          </div>
          <div className="max-w-2xl">
            <span className="text-accent font-bold tracking-wider uppercase text-sm mb-4 block">{badge}</span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              Build Your Career <span className="text-accent">With Us</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/70 leading-relaxed mb-8"
            >
              {description}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={scrollToJobs}
                className="bg-accent hover:bg-accent/90 text-white px-4 sm:px-8 py-4 font-bold transition-all shadow-lg shadow-accent/20 rounded-full"
              >
                View Open Positions
              </button>
              <a 
                href="#culture"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 sm:px-8 py-4 font-bold transition-all rounded-full"
              >
                Learn About Our Culture
              </a>
            </motion.div>
          </div>
        </div>
      
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 ">
          <ScrollToFooterArrow />
        </div>
      </section>

      {/* 2. Why Work With Us */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Why Work With Us</h2>
            <p className="text-dark/70">We believe in taking care of our team so they can take care of our customers. Here is what you can expect when you join.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PERKS.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div key={idx} className="bg-white rounded-[1px] p-6 sm:p-8 border border-dark/10 hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="w-14 h-14 bg-slate-50 border border-dark/10 rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:bg-accent transition-colors">
                    <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-3">{perk.title}</h3>
                  <p className="text-dark/70 leading-relaxed">{perk.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Life at the Company */}
      <section id="culture" className="py-12 md:py-20 bg-primary text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center">
            <div className="w-full lg:w-1/2 space-y-6">
              <span className="text-accent font-bold tracking-wider uppercase text-sm">Life at Santa Towing</span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">More than just a workplace.</h2>
              <p className="text-white/70 text-lg leading-relaxed">
                We foster a culture of continuous learning, mutual respect, and relentless dedication to quality. Whether you're turning wrenches in the bay, coordinating complex towing operations, or greeting customers at the front desk, your contribution matters here.
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                We invest heavily in our facilities, ensuring our team has access to clean, modern environments and the best tools in the industry. But more importantly, we invest in our people.
              </p>
              <div className="pt-4 grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-dark p-2.5 sm:p-4 rounded-[1px] text-center border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mb-1">150+</div>
                  <div className="text-xs sm:text-sm text-white/70 leading-tight">Team Members</div>
                </div>
                <div className="bg-dark p-2.5 sm:p-4 rounded-[1px] text-center border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mb-1">4</div>
                  <div className="text-xs sm:text-sm text-white/70 leading-tight">Locations</div>
                </div>
                <div className="bg-dark p-2.5 sm:p-4 rounded-[1px] text-center border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mb-1">10+</div>
                  <div className="text-xs sm:text-sm text-white/70 leading-tight">Years in Business</div>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:pb-8">
                <img 
                  src={suspensionPartsMaintenance} 
                  alt="Santa Towing mechanics performing suspension inspection" 
                  loading="lazy"
                  decoding="async"
                  className="rounded-[1px] w-full h-48 lg:h-64 object-cover"
                />
                <img 
                  src={carLightingMaintenance} 
                  alt="Santa Towing automotive technicians and customer care bay" 
                  loading="lazy"
                  decoding="async"
                  className="rounded-[1px] w-full h-48 lg:h-64 object-cover sm:translate-y-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 & 5. Open Positions */}
      <section id="open-positions" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Current Openings</h2>
            <p className="text-dark/70">Explore our current job opportunities. Don't see a perfect match? Submit a general application below.</p>
          </div>
          
          {/* Filters */}
          <div className="flex overflow-x-auto no-scrollbar py-4 gap-2 mb-8 border-b border-dark/20">
            {DEPARTMENTS.map(dept => (
              <button
                key={dept}
                onClick={() => { setActiveFilter(dept); setExpandedJobId(null); setIsApplyingFor(null); }}
                className={cn(
                  "px-6 py-2.5 rounded-md text-sm font-bold whitespace-nowrap transition-all",
                  activeFilter === dept 
                    ? "bg-primary text-white shadow-md" 
                    : "bg-white border border-dark/20 text-dark/70 hover:border-accent hover:text-accent"
                )}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Job List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredJobs.map((job) => (
                <motion.div 
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-dark/20 rounded-[1px] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Job Header (Always visible) */}
                  <button
                    type="button"
                    aria-expanded={expandedJobId === job.id}
                    onClick={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
                    className="w-full text-left p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-dark mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-dark/70 font-medium">
                        <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-[1px] text-dark"><Briefcase className="w-4 h-4" /> {job.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-4">
                      {expandedJobId !== job.id && (
                        <span className="bg-primary hover:bg-black text-white px-6 py-2.5 font-bold transition-all hidden sm:inline-block rounded-full">
                          View Details
                        </span>
                      )}
                      <div className={cn(
                        "w-10 h-10 rounded-xl border border-dark/20 flex items-center justify-center transition-transform",
                        expandedJobId === job.id ? "rotate-90 bg-slate-100" : ""
                      )}>
                        <ChevronRight className="w-5 h-5 text-dark/70" />
                      </div>
                    </div>
                  </button>

                  {/* Job Details (Expandable) */}
                  <AnimatePresence>
                    {expandedJobId === job.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 sm:p-8 border-t border-dark/10 bg-white flex flex-col lg:flex-row gap-8">
                          
                          <div className="flex-1 space-y-8">
                            <div>
                              <h4 className="font-bold text-dark text-lg mb-3">About the Role</h4>
                              <p className="text-dark/70 leading-relaxed">{job.description}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-bold text-dark text-lg mb-3">Responsibilities</h4>
                              <ul className="space-y-2">
                                {job.responsibilities.map((req, i) => (
                                  <li key={i} className="flex items-start gap-2 text-dark/70">
                                    <div className="w-1.5 h-1.5 rounded-[1px] bg-primary mt-2 shrink-0" />
                                    <span className="leading-relaxed">{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-bold text-dark text-lg mb-3">Requirements</h4>
                              <ul className="space-y-2">
                                {job.requirements.map((req, i) => (
                                  <li key={i} className="flex items-start gap-2 text-dark/70">
                                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="w-full lg:w-1/3">
                            <div className="bg-white p-6 rounded-[1px] border border-dark/20 shadow-sm sticky top-32">
                              <h4 className="font-bold text-dark text-lg mb-4">Benefits</h4>
                              <ul className="space-y-3 mb-8">
                                {job.benefits.map((benefit, i) => (
                                  <li key={i} className="flex items-center gap-2 text-dark/70 text-sm font-medium">
                                    <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                      <Award className="w-4 h-4" />
                                    </div>
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                              
                              {!isApplyingFor || isApplyingFor !== job.id ? (
                                <button 
                                  onClick={() => { resetApplicationState(); setIsApplyingFor(job.id); }}
                                  className="w-full bg-accent hover:bg-accent/90 text-white px-6 py-4 font-bold transition-all shadow-lg flex justify-center items-center gap-2 text-lg rounded-full"
                                >
                                  Apply Now <ArrowRight className="w-5 h-5" />
                                </button>
                              ) : (
                                <div className="text-center p-4 bg-white rounded-[1px] border border-dark/20">
                                  <span className="font-bold text-dark mb-2 block">Application Form Open</span>
                                  <span className="text-sm text-dark/70">Scroll down to complete your application.</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Application Form Drawer (per job) */}
                  <AnimatePresence>
                    {isApplyingFor === job.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-primary text-white"
                      >
                        <div className="p-6 sm:p-8 md:p-10 border-t border-white/20 relative">
                          <button 
                            type="button"
                            aria-label="Close application form"
                            onClick={() => { resetApplicationState(); setIsApplyingFor(null); }}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          
                          <h3 className="text-xl sm:text-2xl font-bold mb-2 pr-12">Apply for {job.title}</h3>
                          <p className="text-white/80 mb-8">Please fill out the form below to submit your application.</p>
                          
                          {applicationSuccess ? (
                            <div className="bg-white/10 border border-white/25 rounded-[1px] p-6 text-center">
                              <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-white" />
                              </div>
                              <h4 className="text-xl font-bold text-white mb-2">Application Submitted!</h4>
                              <p className="text-white/80">Thank you for applying. Our hiring team will review your application and be in touch soon.</p>
                            </div>
                          ) : (
                            <form onSubmit={handleApply} className="space-y-6">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-white/90">Full Name *</label>
                                  <input name="fullName" type="text" required maxLength={100} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-white/90">Email Address *</label>
                                  <input name="email" type="email" required maxLength={120} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-white/90">Phone Number *</label>
                                  <input name="phone" type="tel" required maxLength={25} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-white/90">Portfolio / LinkedIn URL</label>
                                  <input name="portfolioUrl" type="url" maxLength={500} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-bold text-white/90">Resume / CV *</label>
                                <input
                                  ref={resumeInputRef}
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  className="hidden"
                                  onChange={(e) => validateAndSetResume(e.target.files?.[0] || null)}
                                />
                                <div
                                  onDragOver={(e) => { e.preventDefault(); setIsDraggingResume(true); }}
                                  onDragLeave={() => setIsDraggingResume(false)}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDraggingResume(false);
                                    validateAndSetResume(e.dataTransfer.files?.[0] || null);
                                  }}
                                  onClick={() => { if (!resumeFile) resumeInputRef.current?.click(); }}
                                  className={cn(
                                    "border-2 border-dashed rounded-[1px] p-6 text-center transition-colors bg-white/5",
                                    !resumeFile && "cursor-pointer",
                                    isDraggingResume ? "border-accent bg-accent/10" : "border-white/20 hover:border-accent/50"
                                  )}
                                >
                                  <Paperclip className="w-8 h-8 text-white/80 mx-auto mb-3" />
                                  {resumeFile ? (
                                    <div className="space-y-2">
                                      <p className="text-sm font-bold text-white break-all">{resumeFile.name}</p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setResumeFile(null);
                                          if (resumeInputRef.current) resumeInputRef.current.value = '';
                                        }}
                                        className="text-accent font-bold text-xs hover:underline"
                                      >
                                        Remove file
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm text-white/80 mb-1">Drag and drop your resume here or</p>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); resumeInputRef.current?.click(); }}
                                        className="text-accent font-bold text-sm hover:underline rounded-full"
                                      >
                                        Browse files
                                      </button>
                                      <p className="text-xs text-white/70 mt-2">PDF, DOC, DOCX up to 5MB</p>
                                    </>
                                  )}
                                </div>
                                {resumeError && (
                                  <p className="text-xs font-semibold text-red-300 mt-1">{resumeError}</p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-bold text-white/70">Cover Letter / Message</label>
                                <textarea name="coverLetter" rows={4} maxLength={2000} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none" placeholder="Tell us why you're a great fit for this role..."></textarea>
                              </div>

                              {applicationError && (
                                <p className="text-sm font-semibold text-red-200 bg-red-900/40 border border-red-300/30 rounded-lg px-4 py-2.5">
                                  {applicationError}
                                </p>
                              )}

                              <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-accent hover:bg-accent/90 text-white font-bold px-4 sm:px-8 py-4 transition-all shadow-lg flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-50 rounded-full"
                              >
                                {isSubmitting ? 'Submitting...' : 'Submit Application'} <Send className="w-5 h-5" />
                              </button>
                            </form>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              ))}
              
              {filteredJobs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-[1px] border border-dark/20">
                  <div className="w-16 h-16 bg-slate-50 border border-dark/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-dark/70" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">No openings in this department</h3>
                  <p className="text-dark/70">Check back later or submit a general application.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>



      {/* 7. Our Hiring Process */}
      <section className="py-12 md:py-20 bg-white border-y border-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">Our Hiring Process</h2>
            <p className="text-dark/70 max-w-2xl mx-auto">We value your time. Our process is designed to be transparent, efficient, and respectful of your career journey.</p>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-dark/10 -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {PROCESS_STEPS.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-xl border-4 border-dark/10 shadow-md flex items-center justify-center text-xl font-bold text-dark mb-4">
                    {idx + 1}
                  </div>
                  <h3 className="font-bold text-dark mb-2">{step.title}</h3>
                  <p className="text-sm text-dark/70 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8 & 9. CTA Banner */}
      <section className="py-12 md:py-20 bg-primary text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full" />
        
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join Our Team?</h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Even if you don't see a perfect role listed today, we are always on the lookout for great talent. Submit a general application and we'll reach out when a match opens up.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={scrollToJobs}
              className="bg-accent hover:bg-accent/90 text-white px-4 sm:px-8 py-4 font-bold transition-all shadow-xl text-lg rounded-full"
            >
              View Open Positions
            </button>
            <Link to="/contact" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 sm:px-8 py-4 font-bold transition-all shadow-xl text-lg rounded-full">
              Submit General Application
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
