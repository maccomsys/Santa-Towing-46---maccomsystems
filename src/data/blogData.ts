import {
  towingVehicleFlatbed,
  pickupToyotaHilux2023,
  engineOilFluidsMaintenance,
  suvKiaSportage2024,
  carBatteryMaintenance,
  luxuryMercedesBenz,
  vanHyundaiH12022,
  santaLogo,
  autoAccessories,
} from '@/assets/images';

export const BLOG_CATEGORIES = [
  'All', 
  'Towing Tips', 
  'Car Care', 
  'Roadside Safety', 
  'Emergency Assistance', 
  'Car Recovery', 
  'Automotive Guides', 
  'Company News'
];

export const BLOG_POSTS = [
  {
    id: 1,
    title: 'What to Do If Your Car Breaks Down on a Busy Highway',
    excerpt: 'Step-by-step instructions to keep yourself safe while waiting for emergency assistance or a tow truck on high-speed roads.',
    category: 'Emergency Assistance',
    image: towingVehicleFlatbed,
    author: 'David Mensah',
    authorImg: pickupToyotaHilux2023,
    date: 'Oct 15, 2023',
    readTime: '6 min read',
    tags: ['Safety', 'Emergency', 'Highway', 'Towing']
  },
  {
    id: 2,
    title: '5 Essential Summer Car Care Tips',
    excerpt: 'Keep your car running cool during the hot summer months with these simple engine, coolant, and tire checks.',
    category: 'Car Care',
    image: engineOilFluidsMaintenance,
    author: 'Sarah Osei',
    authorImg: suvKiaSportage2024,
    date: 'Sep 28, 2023',
    readTime: '4 min read',
    tags: ['Maintenance', 'Summer', 'Coolant', 'Tires']
  },
  {
    id: 3,
    title: 'How to Prevent Battery Drain in Older Cars',
    excerpt: 'Learn the common causes of parasitic battery drain and how to ensure your car starts reliably every morning.',
    category: 'Automotive Guides',
    image: carBatteryMaintenance,
    author: 'Kwame A.',
    authorImg: luxuryMercedesBenz,
    date: 'Sep 15, 2023',
    readTime: '5 min read',
    tags: ['Battery', 'Electrical', 'Maintenance']
  },
  {
    id: 4,
    title: 'Understanding Flatbed vs. Wheel-Lift Towing',
    excerpt: 'Which towing method is right for your car? We break down the differences and explain when to request a flatbed.',
    category: 'Towing Tips',
    image: towingVehicleFlatbed,
    author: 'David Mensah',
    authorImg: pickupToyotaHilux2023,
    date: 'Aug 22, 2023',
    readTime: '7 min read',
    tags: ['Towing', 'Flatbed', 'Car Recovery']
  },
  {
    id: 5,
    title: 'Santa Towing Expands Service Fleet in Greater Accra',
    excerpt: 'We are thrilled to announce the addition of three new heavy-duty recovery trucks and support cars to serve our commercial clients better.',
    category: 'Company News',
    image: vanHyundaiH12022,
    author: 'Management',
    authorImg: santaLogo,
    date: 'Aug 10, 2023',
    readTime: '3 min read',
    tags: ['News', 'Expansion', 'Fleet']
  },
  {
    id: 6,
    title: 'Essential Items for Your Roadside Emergency Kit',
    excerpt: 'Don\'t get caught unprepared. Here are the 10 must-have items every driver should keep in their trunk for emergencies.',
    category: 'Roadside Safety',
    image: autoAccessories,
    author: 'Sarah Osei',
    authorImg: suvKiaSportage2024,
    date: 'Jul 05, 2023',
    readTime: '5 min read',
    tags: ['Safety', 'Emergency Kit', 'Preparation']
  }
];
