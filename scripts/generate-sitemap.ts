import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SITEMAP_DATA } from '../src/data/sitemapData';
import { TOWING_ADVERTS } from '../src/data/towingAdverts';
import { SERVICE_AREA_ROUTES } from '../src/data/serviceAreaRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = process.env.VITE_SITE_URL || 'https://santatowing.com';

const STANDARD_SERVICES = [
  { id: 'emergency-towing', title: 'Emergency Towing' },
  { id: 'scheduled-towing', title: 'Scheduled Towing' },
  { id: 'car-recovery', title: 'Car Recovery' },
  { id: 'long-distance-towing', title: 'Long-Distance Towing' }
];

async function generateSitemap() {
  console.log('Generating comprehensive sitemap.xml...');
  const urls: string[] = [];
  const addedUrls = new Set<string>();

  const addUrl = (url: string) => {
    // Normalize url
    const cleanUrl = url.split('#')[0].split('?')[0];
    if (cleanUrl.startsWith('/admin') || cleanUrl === '/nanadmin' || cleanUrl === '/search') {
      return;
    }
    if (cleanUrl && !addedUrls.has(cleanUrl) && cleanUrl !== '/404' && cleanUrl !== '*') {
      urls.push(cleanUrl);
      addedUrls.add(cleanUrl);
    }
  };

  // 1. Add all URLs from centralized SITEMAP_CATEGORIES registry
  for (const cat of SITEMAP_DATA) {
    for (const link of cat.links) {
      addUrl(link.path);
    }
  }

  // 2. Automatically verify any additional static routes from AppRoutes.tsx (excluding admin console)
  const appRoutesPath = path.resolve(__dirname, '../src/routes/AppRoutes.tsx');
  if (fs.existsSync(appRoutesPath)) {
    const appRoutesContent = fs.readFileSync(appRoutesPath, 'utf8');
    const routeRegex = /<Route[^>]+path=["']([^"']+)["']/g;
    let match;
    while ((match = routeRegex.exec(appRoutesContent)) !== null) {
      const routePath = match[1];
      if (
        !routePath.includes(':') &&
        !routePath.includes('*') &&
        routePath !== '/search' &&
        routePath !== '/404' &&
        routePath !== '/nanadmin' &&
        !routePath.startsWith('/admin') &&
        !['colors', 'logo', 'links', 'pages-text', 'images', 'inventory', 'profile', 'invoices', 'receipts', 'customers', 'image-studio', 'doc-settings', 'backup'].includes(routePath)
      ) {
        addUrl(routePath);
      }
    }
  }

  // 3. Static corridor service area routes from SERVICE_AREA_ROUTES
  for (const route of SERVICE_AREA_ROUTES) {
    addUrl(`/service-areas/${route.slug}`);
  }

  // 4. Dynamic service area routes from TOWING_ADVERTS
  const areas = Array.from(new Set(TOWING_ADVERTS.map(ad => ad.district))).sort();
  areas.forEach(area => {
    const areaSlug = area.toLowerCase().replace(/ /g, '-');
    addUrl(`/service-areas/${areaSlug}`);
    
    STANDARD_SERVICES.forEach(service => {
      addUrl(`/service-areas/${areaSlug}/${service.id}`);
    });
  });

  // 5. Dynamic car sales routes from mockData.ts
  const mockDataPath = path.resolve(__dirname, '../src/data/mockData.ts');
  if (fs.existsSync(mockDataPath)) {
    const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
    const carsBlockMatch = mockDataContent.match(/export const CARS = \[([\s\S]*?)\n\];/);
    if (carsBlockMatch) {
      const carIdRegex = /\{\s*id:\s*['"]?([a-zA-Z0-9_-]+)['"]?/g;
      let match;
      while ((match = carIdRegex.exec(carsBlockMatch[1])) !== null) {
        addUrl(`/sales/${match[1]}`);
      }
    }
  }

  // 6. Dynamic blog posts routes from blogData.ts
  const blogDataPath = path.resolve(__dirname, '../src/data/blogData.ts');
  if (fs.existsSync(blogDataPath)) {
    const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');
    const blogBlockMatch = blogDataContent.match(/export const BLOG_POSTS = \[([\s\S]*?)\n\];/);
    if (blogBlockMatch) {
      const postIdRegex = /\{\s*id:\s*['"]?([a-zA-Z0-9_-]+)['"]?/g;
      let match;
      while ((match = postIdRegex.exec(blogBlockMatch[1])) !== null) {
        addUrl(`/blog/${match[1]}`);
      }
    }
  }

  // 7. Dynamic parts routes from inventoryDefaults.ts (DEFAULT_PARTS)
  const inventoryDefaultsPath = path.resolve(__dirname, '../src/data/inventoryDefaults.ts');
  if (fs.existsSync(inventoryDefaultsPath)) {
    const inventoryContent = fs.readFileSync(inventoryDefaultsPath, 'utf8');
    const partsBlockMatch = inventoryContent.match(/export const DEFAULT_PARTS[^=]*=\s*\[([\s\S]*?)\n\];/);
    if (partsBlockMatch) {
      const partIdRegex = /\{\s*id:\s*['"]?(\d+)['"]?/g;
      let match;
      while ((match = partIdRegex.exec(partsBlockMatch[1])) !== null) {
        addUrl(`/parts/${match[1]}`);
      }
    }

    // 8. Dynamic car rental routes from inventoryDefaults.ts (DEFAULT_RENTALS)
    const rentalsBlockMatch = inventoryContent.match(/export const DEFAULT_RENTALS[^=]*=\s*\[([\s\S]*?)\n\];/);
    if (rentalsBlockMatch) {
      const rentalIdRegex = /\{\s*id:\s*['"]?([a-zA-Z0-9_-]+)['"]?/g;
      let match;
      while ((match = rentalIdRegex.exec(rentalsBlockMatch[1])) !== null) {
        addUrl(`/rental/${match[1]}`);
      }
    }
  }

  // Compute Priority & Changefreq based on path depth and type
  const getPriority = (url: string) => {
    if (url === '/') return '1.0';
    if (url === '/towing' || url === '/haulage' || url === '/services' || url === '/contact') return '0.9';
    if (url === '/sales' || url === '/rental' || url === '/repairs' || url === '/parts' || url === '/blog' || url === '/service-areas') return '0.85';
    if (url.startsWith('/sales/') || url.startsWith('/rental/') || url.startsWith('/parts/') || url.startsWith('/blog/')) return '0.8';
    if (url.startsWith('/service-areas/')) return '0.7';
    if (url === '/sitemap') return '0.6';
    return '0.5';
  };

  const getChangeFreq = (url: string) => {
    if (url === '/' || url === '/towing' || url === '/haulage') return 'daily';
    if (url === '/sales' || url === '/rental' || url === '/blog' || url === '/parts') return 'weekly';
    if (url.startsWith('/blog/')) return 'weekly';
    return 'monthly';
  };

  const today = new Date().toISOString().split('T')[0];
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${DOMAIN}${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${getChangeFreq(url)}</changefreq>
    <priority>${getPriority(url)}</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(path.resolve(publicDir, 'sitemap.xml'), sitemapContent);
  console.log(`Sitemap generated successfully at public/sitemap.xml with ${urls.length} verified URLs.`);
}

generateSitemap();
