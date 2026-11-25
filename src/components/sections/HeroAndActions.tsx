import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, animate, useReducedMotion } from 'motion/react';
import { HERO_SLIDES, QUICK_ACTIONS } from '@/data/mockData';
import { ChevronLeft, ChevronRight, Phone, MessageCircle, ArrowRight, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import ScrollToFooterArrow from '@/components/ui/ScrollToFooterArrow';
import { useContent } from '@/hooks/useContent';
import EditableText from '@/components/editable/EditableText';
import EditableImage from '@/components/editable/EditableImage';
import {
  sanitizeHexColor,
  sanitizeHttpUrl,
  sanitizeImageUrl,
  sanitizeNavigationTarget,
  sanitizeTelUrl,
} from '@/lib/security';

const SLIDE_TRANSITION_EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_TRANSITION_DURATION = 0.85;
const SLIDE_SCALE_DURATION = 1.05;

interface SlideBackgroundLayerProps {
  slide: any;
  index: number;
  isActive: boolean;
  isSettled: boolean;
  direction: 1 | -1;
  shouldReduceMotion: boolean;
}

function SlideBackgroundLayer({
  slide,
  index,
  isActive,
  isSettled,
  direction,
  shouldReduceMotion,
}: SlideBackgroundLayerProps) {
  const opacity = useMotionValue(isActive ? 1 : 0);
  const x = useMotionValue(0);
  const scale = useMotionValue(1);
  const isFirstMount = useRef(true);
  const wasActiveRef = useRef(isActive);
  const activeAnimationsRef = useRef<Array<{ stop: () => void }>>([]);

  const stopRunningAnimations = useCallback(() => {
    activeAnimationsRef.current.forEach((ctrl) => ctrl.stop());
    activeAnimationsRef.current = [];
  }, []);

  useLayoutEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      wasActiveRef.current = isActive;
      opacity.set(isActive ? 1 : 0);
      x.set(0);
      scale.set(1);
      return;
    }

    const wasActive = wasActiveRef.current;
    wasActiveRef.current = isActive;

    if (isActive && !wasActive) {
      stopRunningAnimations();

      const currentOpacity = opacity.get();
      if (currentOpacity <= 0.05) {
        opacity.set(0);
        x.set(shouldReduceMotion ? 0 : direction * 44);
        scale.set(shouldReduceMotion ? 1 : 1.04);
      }

      activeAnimationsRef.current.push(
        animate(opacity, 1, {
          duration: SLIDE_TRANSITION_DURATION,
          ease: SLIDE_TRANSITION_EASE,
        })
      );

      if (!shouldReduceMotion) {
        activeAnimationsRef.current.push(
          animate(x, 0, {
            duration: SLIDE_TRANSITION_DURATION,
            ease: SLIDE_TRANSITION_EASE,
          }),
          animate(scale, 1, {
            duration: SLIDE_SCALE_DURATION,
            ease: SLIDE_TRANSITION_EASE,
          })
        );
      } else {
        x.set(0);
        scale.set(1);
      }
    } else if (!isActive && wasActive) {
      stopRunningAnimations();
      if (!shouldReduceMotion) {
        activeAnimationsRef.current.push(
          animate(x, -direction * 28, {
            duration: SLIDE_TRANSITION_DURATION,
            ease: SLIDE_TRANSITION_EASE,
          }),
          animate(scale, 1.015, {
            duration: SLIDE_TRANSITION_DURATION,
            ease: SLIDE_TRANSITION_EASE,
          })
        );
      }
    }
  }, [isActive, direction, shouldReduceMotion, opacity, x, scale, stopRunningAnimations]);

  useEffect(() => {
    if (isSettled && !isActive) {
      stopRunningAnimations();
      opacity.set(0);
      x.set(0);
      scale.set(1);
    }
  }, [isSettled, isActive, opacity, x, scale, stopRunningAnimations]);

  useEffect(() => {
    return () => {
      stopRunningAnimations();
    };
  }, [stopRunningAnimations]);

  return (
    <motion.div
      style={{ opacity, x, scale }}
      aria-hidden={!isActive}
      className={cn(
        'absolute inset-0 will-change-transform',
        isActive ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      <EditableImage
        storageKey={`home.hero.slides.${index}.image`}
        altStorageKey={`home.hero.slides.${index}.imageAlt`}
        defaultUrl={slide.image}
        defaultAlt={(slide as any).imageAlt || `Slide ${index + 1} recovery photo`}
        className="w-full h-full object-cover"
        label={`Slide ${index + 1} Background Image`}
        loading={index === 0 ? 'eager' : 'lazy'}
        fetchPriority={index === 0 ? 'high' : 'low'}
      />
    </motion.div>
  );
}

export function HeroSlider() {
  const slides = useContent('home.hero.slides', HERO_SLIDES);
  const phone = useContent('global.links.phone', '0244753849');
  const phoneTel = useContent('global.links.phoneTel', 'tel:0244753849');
  const whatsapp = useContent('global.links.whatsapp', 'https://wa.me/233244753849');
  const safePhoneTel = sanitizeTelUrl(phoneTel || `tel:${phone}`);
  const safeWhatsapp = sanitizeHttpUrl(whatsapp, 'https://wa.me/233244753849');

  const activeSlides = useMemo(
    () => (Array.isArray(slides) && slides.length > 0 ? slides : HERO_SLIDES),
    [slides]
  );
  const totalSlides = activeSlides.length;

  const [slideState, setSlideState] = useState<{ index: number; direction: 1 | -1 }>({
    index: 0,
    direction: 1,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [layerOrder, setLayerOrder] = useState<number[]>(() => {
    const indices = activeSlides.map((_, idx) => idx);
    return [...indices.slice(1), 0];
  });
  const [settledSlide, setSettledSlide] = useState<number | null>(0);

  const settledTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());

  const currentSlide = totalSlides > 0 ? slideState.index % totalSlides : 0;
  const direction = slideState.direction;

  // Preload secondary hero slide images gently after initial paint so LCP slide 0 isn't contended
  useEffect(() => {
    if (typeof window === 'undefined' || activeSlides.length <= 1) return;
    const timer = window.setTimeout(() => {
      activeSlides.slice(1).forEach((slide: any) => {
        const safeSlideImage = sanitizeImageUrl(slide?.image, '');
        if (safeSlideImage) {
          const img = new Image();
          img.decoding = 'async';
          img.src = safeSlideImage;
        }
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [activeSlides]);

  // Keep layer stacking order synced with active slide and slide count
  useEffect(() => {
    setLayerOrder((prev) => {
      const valid = prev.filter((idx) => idx < totalSlides && idx !== currentSlide);
      for (let i = 0; i < totalSlides; i++) {
        if (i !== currentSlide && !valid.includes(i)) {
          valid.unshift(i);
        }
      }
      return [...valid, currentSlide];
    });
  }, [currentSlide, totalSlides]);

  // Mark slide transition settled after incoming crossfade completes so hidden slides reset invisibly
  useEffect(() => {
    if (settledTimerRef.current !== null) {
      window.clearTimeout(settledTimerRef.current);
    }
    setSettledSlide(null);
    settledTimerRef.current = window.setTimeout(() => {
      setSettledSlide(currentSlide);
      settledTimerRef.current = null;
    }, Math.round(SLIDE_TRANSITION_DURATION * 1000) + 60);

    return () => {
      if (settledTimerRef.current !== null) {
        window.clearTimeout(settledTimerRef.current);
        settledTimerRef.current = null;
      }
    };
  }, [currentSlide]);

  // Maintain exact existing automatic rotation timing (8000ms on first slide, 5000ms on others)
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = window.setTimeout(() => {
      setSlideState((prev) => ({
        index: (prev.index + 1) % totalSlides,
        direction: 1,
      }));
    }, currentSlide === 0 ? 8000 : 5000);
    return () => window.clearTimeout(timer);
  }, [currentSlide, isPaused, totalSlides]);

  const nextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setSlideState((prev) => ({
      index: (prev.index + 1) % totalSlides,
      direction: 1,
    }));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setSlideState((prev) => ({
      index: (prev.index - 1 + totalSlides) % totalSlides,
      direction: -1,
    }));
  }, [totalSlides]);

  const goToSlide = useCallback(
    (targetIdx: number) => {
      if (targetIdx < 0 || targetIdx >= totalSlides) return;
      setSlideState((prev) => {
        if (prev.index === targetIdx) return prev;
        return {
          index: targetIdx,
          direction: targetIdx > prev.index ? 1 : -1,
        };
      });
    },
    [totalSlides]
  );

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const activeSlide = activeSlides[currentSlide] || HERO_SLIDES[0];

  return (
    <div
      className="relative min-h-[640px] md:min-h-[700px] lg:h-[88vh] lg:min-h-[700px] w-full overflow-hidden bg-dark"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Persistent Layered Slide Backgrounds */}
      <div className="absolute inset-0 z-0">
        {activeSlides.map((slide: any, idx: number) => {
          const orderIndex = layerOrder.indexOf(idx);
          const zIndex = orderIndex === -1 ? idx + 1 : orderIndex + 1;
          return (
            <div
              key={slide.id ?? idx}
              style={{ zIndex }}
              className="absolute inset-0 pointer-events-none"
            >
              <SlideBackgroundLayer
                slide={slide}
                index={idx}
                isActive={idx === currentSlide}
                isSettled={settledSlide === currentSlide}
                direction={direction}
                shouldReduceMotion={shouldReduceMotion}
              />
            </div>
          );
        })}
      </div>

      {/* Persistent Dark Corporate Overlays for High Contrast (no flicker between slides) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-dark/95 via-dark/80 to-dark/40 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-dark/90 via-transparent to-black/30 pointer-events-none" />

      {/* Slide Content */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 1, zIndex: 15 }}
          animate={{ opacity: 1, zIndex: 15 }}
          exit={{
            opacity: 0,
            y: shouldReduceMotion ? 0 : -12,
            zIndex: 14,
            transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
          }}
          className="absolute inset-0 flex items-center pointer-events-none"
        >
          <div className="max-w-7xl mx-auto px-12 sm:px-14 lg:px-16 w-full pt-20 pb-36 md:py-0">
            <div className="max-w-2xl lg:max-w-3xl pointer-events-auto">
              {/* Main Headline */}
              <motion.h1
                initial={{ y: shouldReduceMotion ? 0 : 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, ease: SLIDE_TRANSITION_EASE }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]"
              >
                <EditableText
                  as="span"
                  storageKey={`home.hero.slides.${currentSlide}.headline`}
                  defaultContent={activeSlide.headline}
                  label={`Slide ${currentSlide + 1} Headline`}
                />
              </motion.h1>

              {/* Subheadline / Body Text */}
              <motion.div
                initial={{ y: shouldReduceMotion ? 0 : 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6, ease: SLIDE_TRANSITION_EASE }}
                className="text-base sm:text-lg md:text-xl text-white/85 mb-8 leading-relaxed max-w-2xl font-normal"
              >
                <EditableText
                  as="p"
                  multiline={true}
                  storageKey={`home.hero.slides.${currentSlide}.subheadline`}
                  defaultContent={activeSlide.subheadline}
                  label={`Slide ${currentSlide + 1} Subheadline`}
                />
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: shouldReduceMotion ? 0 : 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6, ease: SLIDE_TRANSITION_EASE }}
                className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8"
              >
                {activeSlide.buttons &&
                  activeSlide.buttons.map((btn: any, idx: number) => {
                    const labelStr = typeof btn.label === 'string' ? btn.label : '';
                    const hrefStr = typeof btn.href === 'string' ? btn.href.trim() : '';
                    const isInternal = hrefStr.startsWith('/') && !hrefStr.startsWith('//') && !hrefStr.includes('\\');
                    const isWhatsApp =
                      hrefStr.startsWith('https://wa.me') ||
                      labelStr.toLowerCase().includes('whatsapp');
                    const isPhone =
                      hrefStr.startsWith('tel:') ||
                      labelStr.includes('0244753849') ||
                      labelStr.includes('Call');

                    const safeColor = btn.color ? sanitizeHexColor(btn.color, '') : '';
                    const styleObj = safeColor ? { backgroundColor: safeColor } : {};

                    const className = cn(
                      'px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5',
                      !safeColor && btn.primary
                        ? 'bg-accent hover:bg-accent/90 text-white shadow-accent/30 hover:shadow-accent/50'
                        : !safeColor && isWhatsApp
                        ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/30'
                        : !safeColor
                        ? 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 hover:border-white/40'
                        : 'text-white'
                    );

                    if (isInternal && !isPhone && !isWhatsApp) {
                      const safeInternalHref = sanitizeNavigationTarget(hrefStr, '/services');
                      return (
                        <Link to={safeInternalHref} key={idx} className={className} style={styleObj}>
                          <EditableText
                            storageKey={`home.hero.slides.${currentSlide}.buttons.${idx}.label`}
                            defaultContent={btn.label}
                            label={`Slide ${currentSlide + 1} Button ${idx + 1}`}
                          />
                        </Link>
                      );
                    }

                    const resolvedHref = isPhone
                      ? safePhoneTel
                      : isWhatsApp
                      ? safeWhatsapp
                      : sanitizeNavigationTarget(hrefStr, '#');
                    const isExternalHttp = resolvedHref.startsWith('http://') || resolvedHref.startsWith('https://');

                    return (
                      <a
                        href={resolvedHref}
                        key={idx}
                        className={className}
                        style={styleObj}
                        target={isExternalHttp ? '_blank' : undefined}
                        rel={isExternalHttp ? 'noopener noreferrer' : undefined}
                      >
                        {isPhone && !isWhatsApp && <Phone className="w-4 h-4" />}
                        {isWhatsApp && <MessageCircle className="w-4 h-4" />}
                        <EditableText
                          storageKey={`home.hero.slides.${currentSlide}.buttons.${idx}.label`}
                          defaultContent={btn.label}
                          label={`Slide ${currentSlide + 1} Button ${idx + 1}`}
                        />
                      </a>
                    );
                  })}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full px-1.5 sm:px-4 lg:px-6 flex justify-between pointer-events-none z-20">
        <button
          onClick={prevSlide}
          className="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-dark/60 hover:bg-accent text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/15 shadow-lg hover:scale-105 rounded-full"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-dark/60 hover:bg-accent text-white flex items-center justify-center backdrop-blur-md transition-all border border-white/15 shadow-lg hover:scale-105 rounded-full"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Slide Indicators & Controls */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? 'Play slider' : 'Pause slider'}
          className="text-white/60 hover:text-white transition-colors flex items-center justify-center hover:scale-110 active:scale-95"
          title={isPaused ? 'Play slider' : 'Pause slider'}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === currentSlide ? 'true' : undefined}
              className={cn(
                'h-2 rounded-xl transition-all duration-300',
                idx === currentSlide ? 'w-8 bg-accent shadow-sm' : 'w-2.5 bg-white/40 hover:bg-white/70'
              )}
            />
          ))}
        </div>
      </div>

      {/* Scroll to Footer Arrow */}
      <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 z-20">
        <ScrollToFooterArrow />
      </div>
    </div>
  );
}

export function QuickActions() {
  const customActions = useContent('home.quickActions.items', QUICK_ACTIONS);

  return (
    <div className="relative -mt-14 sm:-mt-20 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
        {customActions.map((action: any, idx: number) => {
          const defaultItem = QUICK_ACTIONS.find(q => q.id === action.id) || QUICK_ACTIONS[idx % QUICK_ACTIONS.length];
          const Icon = defaultItem?.icon || ArrowRight;
          const fallbackPath = (action.title === 'Request Towing' ? '/towing' 
            : action.title === 'Rent a Car' ? '/rental' 
            : action.title === 'Buy a Car' ? '/sales' 
            : action.title === 'Call for Repairs' ? '/repairs' 
            : action.title === 'Body Works & Spray' ? '/body-works' 
            : action.title === 'Buy Batteries' ? '/parts' 
            : action.title === 'Shop Auto Parts' ? '/parts' 
            : '/services');
          const rawPath = typeof action.path === 'string' && action.path.startsWith('/') && !action.path.startsWith('//') && !action.path.includes('\\')
            ? action.path
            : fallbackPath;
          const href = sanitizeNavigationTarget(rawPath, fallbackPath);

          return (
            <motion.div
              key={action.id || idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="relative w-full"
            >
              <Link 
                to={href}
                className="flex flex-col h-full bg-white rounded-[1px] p-4 sm:p-5 lg:p-6 shadow-xl shadow-black/5 border border-gray-100/90 hover:-translate-y-1.5 transition-all duration-300 group hover:shadow-2xl hover:border-accent/30"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white group-hover:shadow-md group-hover:shadow-accent/30 transition-all duration-300 shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:text-secondary transition-colors duration-300" />
                </div>
                <h2 className="font-bold text-dark text-sm sm:text-base lg:text-lg mb-1 leading-snug group-hover:text-accent transition-colors">
                  <EditableText
                    storageKey={`home.quickActions.items.${idx}.title`}
                    defaultContent={action.title}
                    label={`Action ${idx + 1} Title`}
                  />
                </h2>
                <div className="text-xs sm:text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3 flex-1">
                  <EditableText
                    as="p"
                    multiline={true}
                    storageKey={`home.quickActions.items.${idx}.description`}
                    defaultContent={action.description}
                    label={`Action ${idx + 1} Description`}
                  />
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-primary group-hover:text-accent group-hover:translate-x-1 transition-all duration-200 mt-auto">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
