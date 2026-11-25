export interface SearchIndexItem {
  title: string;
  path: string;
  type: 'page' | 'service' | 'car' | 'location' | 'policy';
  excerpt: string;
  keywords: string[];
}

export const SEARCH_INDEX: SearchIndexItem[] = [
  {
    title: 'Home',
    path: '/',
    type: 'page',
    excerpt: 'Santa Towing offers 24/7 towing, auto repairs, body works, car sales, and car rentals in Ghana.',
    keywords: ['home', 'santa towing', 'auto services', 'ghana', 'accra'],
  },
  {
    title: 'Emergency Towing',
    path: '/towing',
    type: 'service',
    excerpt: 'Rapid response 24/7 towing services. We safely transport your car to any destination or our secure facility.',
    keywords: ['towing', 'emergency', 'breakdown', 'recovery', 'flatbed', 'tow truck'],
  },
  {
    title: 'Haulage Services',
    path: '/haulage',
    type: 'service',
    excerpt: 'Specialized heavy machinery transport, flatbed haulage, Tema harbour freight transfer, and oversize plant relocation.',
    keywords: ['haulage', 'heavy transport', 'machinery', 'freight', 'cargo', 'tema harbour', 'lowbed', 'excavator'],
  },
  {
    title: 'Auto Repairs',
    path: '/repairs',
    type: 'service',
    excerpt: 'Comprehensive mechanical repairs, computer diagnostics, and regular maintenance by certified mechanics.',
    keywords: ['repairs', 'mechanic', 'engine', 'diagnostics', 'maintenance', 'oil change', 'brakes'],
  },
  {
    title: 'Body Works & Spray Painting',
    path: '/body-works',
    type: 'service',
    excerpt: 'Professional dent repair, collision restoration, and premium oven-baked spray painting services.',
    keywords: ['body works', 'spray painting', 'dent repair', 'collision', 'paint', 'restoration'],
  },
  {
    title: 'Auto Parts',
    path: '/parts',
    type: 'service',
    excerpt: 'Genuine OEM and high-quality aftermarket spare parts for all major car makes and models.',
    keywords: ['parts', 'spares', 'oem', 'accessories', 'batteries', 'tires', 'engine parts'],
  },
  {
    title: 'Fleet Services',
    path: '/fleet',
    type: 'service',
    excerpt: 'Specialized maintenance and repair programs designed to keep corporate and commercial fleets running efficiently.',
    keywords: ['fleet', 'commercial', 'corporate', 'maintenance program', 'logistics'],
  },
  {
    title: 'Cars for Sale',
    path: '/sales',
    type: 'car',
    excerpt: 'Browse our inventory of quality inspected new and pre-owned cars.',
    keywords: ['sales', 'buy car', 'used cars', 'new cars', 'dealership', 'cars'],
  },
  {
    title: 'Rental Fleet',
    path: '/rental',
    type: 'car',
    excerpt: 'Premium and affordable rental cars for daily, weekly, or monthly use.',
    keywords: ['rental', 'hire', 'rent car', 'suv', 'sedan', 'daily rental'],
  },
  {
    title: 'Service Areas Directory',
    path: '/service-areas',
    type: 'location',
    excerpt: 'View all areas we serve across Greater Accra and beyond for towing and roadside assistance.',
    keywords: ['locations', 'areas', 'accra', 'tema', 'coverage', 'map'],
  },
  {
    title: 'Contact Us',
    path: '/contact',
    type: 'page',
    excerpt: 'Get in touch with Santa Towing for inquiries, quotes, or emergency assistance.',
    keywords: ['contact', 'phone', 'email', 'location', 'address', 'help'],
  },
  {
    title: 'Blog & News',
    path: '/blog',
    type: 'page',
    excerpt: 'Read the latest automotive tips, company news, and industry updates from Santa Towing.',
    keywords: ['blog', 'news', 'tips', 'articles', 'guide'],
  },
  {
    title: 'Frequently Asked Questions',
    path: '/faqs',
    type: 'policy',
    excerpt: 'Find answers to common questions about our towing, repairs, and rental services.',
    keywords: ['faq', 'questions', 'answers', 'help', 'support'],
  },
  {
    title: 'Privacy Policy',
    path: '/privacy-policy',
    type: 'policy',
    excerpt: 'Learn how Santa Towing collects, uses, and protects your personal information.',
    keywords: ['privacy', 'policy', 'data', 'terms', 'security'],
  },
  {
    title: 'Terms & Conditions',
    path: '/terms-conditions',
    type: 'policy',
    excerpt: 'Read our general terms and conditions for using Santa Towing.',
    keywords: ['terms', 'conditions', 'legal', 'agreement'],
  },
  {
    title: 'Careers',
    path: '/careers',
    type: 'page',
    excerpt: 'Join the Santa Towing team. Explore open positions for mechanics, drivers, and admin staff.',
    keywords: ['careers', 'jobs', 'hiring', 'work', 'employment'],
  },
  {
    title: 'Accra Towing Services',
    path: '/service-areas/accra',
    type: 'location',
    excerpt: '24/7 reliable towing and recovery services throughout the Greater Accra region.',
    keywords: ['accra', 'towing in accra', 'east legon', 'spintex', 'osu'],
  },
  {
    title: 'Tema Towing Services',
    path: '/service-areas/tema',
    type: 'location',
    excerpt: 'Fast and professional towing services for Tema and surrounding industrial areas.',
    keywords: ['tema', 'towing in tema', 'industrial', 'port', 'motorway'],
  },
];
