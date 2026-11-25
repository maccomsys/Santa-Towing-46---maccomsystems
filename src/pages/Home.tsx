import React from 'react';
import { HeroSlider, QuickActions } from '@/components/sections/HeroAndActions';
import { AboutSection, ServicesSection } from '@/components/sections/AboutAndServices';
import { HaulageHomeSection } from '@/components/sections/HaulageSection';
import { FeaturedCars, RentalFleet } from '@/components/sections/CarsAndRentals';
import { AutoParts, WhyChooseUs } from '@/components/sections/PartsAndWhyUs';
import { FAQ, BlogSection } from '@/components/sections/BottomSections';
import SEO from '@/components/seo/SEO';
import { useContent } from '@/hooks/useContent';
import { useInventoryFaqs } from '@/hooks/useInventory';
import { FAQS } from '@/data/mockData';
import { heavyDutyRecoveryVehicle } from '@/assets/images';
import { buildFaqSchema, buildLocalBusinessSchema, buildWebsiteSchema } from '@/lib/seoSchemas';

export default function Home() {
  const seoTitle = useContent('seo.home.title', 'Santa Towing | 24/7 Towing, Haulage, Repairs & Rentals in Ghana');
  const seoDescription = useContent('seo.home.description', 'Expert 24/7 emergency towing, nationwide haulage & heavy machinery transport, professional auto repairs, car sales, and premium car rentals in Ghana.');
  const { faqs } = useInventoryFaqs();
  const displayFaqs = faqs && faqs.length > 0 ? faqs.slice(0, 5) : FAQS;

  return (
    <main>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical="/"
        image={heavyDutyRecoveryVehicle}
        imageAlt="Santa Towing heavy duty recovery tow truck in Ghana"
        keywords={[
          'Santa Towing',
          '24/7 emergency towing Ghana',
          'car recovery Accra',
          'heavy haulage Ghana',
          'auto repairs Accra',
          'car rentals Ghana',
          'car sales Ghana',
          'genuine auto parts Ghana',
        ]}
        schema={[
          buildLocalBusinessSchema(),
          buildWebsiteSchema(),
          buildFaqSchema(displayFaqs),
        ]}
      />
      <HeroSlider />
      <QuickActions />
      <AboutSection />
      <ServicesSection />
      <HaulageHomeSection />
      <FeaturedCars />
      <RentalFleet />
      <AutoParts />
      <WhyChooseUs />
      <BlogSection />
      <FAQ />
    </main>
  );
}
