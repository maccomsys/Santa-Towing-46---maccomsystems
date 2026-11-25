export const SITE_URL = 'https://santatowing.com';

export function toAbsoluteUrl(urlOrPath?: string): string | undefined {
  if (!urlOrPath) return undefined;
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  if (urlOrPath.startsWith('data:') || urlOrPath.startsWith('blob:')) return undefined;
  return `${SITE_URL}${urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`}`;
}

export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'Santa Towing & Garage Services Ltd.',
    alternateName: 'Santa Towing',
    url: SITE_URL,
    telephone: '+233244753849',
    email: 'info@santatowing.com',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Spintex Road',
      addressLocality: 'Accra',
      addressRegion: 'Greater Accra',
      addressCountry: 'GH',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Ghana',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    sameAs: [
      'https://facebook.com/santatowing',
      'https://twitter.com/santatowing',
      'https://instagram.com/santatowing',
      'https://linkedin.com/company/santatowing',
    ],
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Santa Towing',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildServiceSchema({
  name,
  description,
  path,
  serviceType,
  areaServed = 'Ghana',
}: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  areaServed?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType,
    description,
    url: toAbsoluteUrl(path),
    provider: {
      '@type': 'AutoRepair',
      name: 'Santa Towing & Garage Services Ltd.',
      url: SITE_URL,
      telephone: '+233244753849',
    },
    areaServed: {
      '@type': 'Place',
      name: areaServed,
    },
  };
}

export function buildFaqSchema(faqs: Array<{ q?: string; a?: string; question?: string; answer?: string }>) {
  const valid = (faqs || [])
    .map((item) => ({
      q: (item.q || item.question || '').trim(),
      a: (item.a || item.answer || '').trim(),
    }))
    .filter((item) => item.q && item.a);

  if (valid.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: valid.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

function parseNumericPrice(rawPrice?: string): string | undefined {
  if (!rawPrice) return undefined;
  const cleaned = rawPrice.replace(/[^0-9.]/g, '');
  if (!cleaned || Number.isNaN(Number(cleaned))) return undefined;
  return cleaned;
}

export function buildProductSchema({
  name,
  description,
  path,
  image,
  price,
  brand,
  sku,
  inStock = true,
  ratingValue,
  reviewCount,
}: {
  name: string;
  description: string;
  path: string;
  image?: string;
  price?: string;
  brand?: string;
  sku?: string;
  inStock?: boolean;
  ratingValue?: number;
  reviewCount?: number;
}) {
  const numericPrice = parseNumericPrice(price);
  const absImage = toAbsoluteUrl(image);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url: toAbsoluteUrl(path),
    ...(absImage ? { image: absImage } : {}),
    ...(sku ? { sku } : {}),
    ...(brand
      ? {
          brand: {
            '@type': 'Brand',
            name: brand,
          },
        }
      : {}),
  };

  if (numericPrice) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'GHS',
      price: numericPrice,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: toAbsoluteUrl(path),
    };
  }

  if (ratingValue && reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
    };
  }

  return schema;
}

export function buildVehicleSchema({
  name,
  description,
  path,
  image,
  price,
  brand,
  year,
  fuel,
  transmission,
  mileage,
  condition,
}: {
  name: string;
  description: string;
  path: string;
  image?: string;
  price?: string;
  brand?: string;
  year?: string | number;
  fuel?: string;
  transmission?: string;
  mileage?: string;
  condition?: string;
}) {
  const numericPrice = parseNumericPrice(price);
  const absImage = toAbsoluteUrl(image);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name,
    description,
    url: toAbsoluteUrl(path),
    ...(absImage ? { image: absImage } : {}),
    ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
    ...(year ? { vehicleModelDate: String(year) } : {}),
    ...(fuel ? { fuelType: fuel } : {}),
    ...(transmission ? { vehicleTransmission: transmission } : {}),
    ...(mileage ? { mileageFromOdometer: mileage } : {}),
    ...(condition
      ? {
          itemCondition:
            condition.toLowerCase() === 'new'
              ? 'https://schema.org/NewCondition'
              : 'https://schema.org/UsedCondition',
        }
      : {}),
  };

  if (numericPrice) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'GHS',
      price: numericPrice,
      availability: 'https://schema.org/InStock',
      url: toAbsoluteUrl(path),
    };
  }

  return schema;
}

export function buildArticleSchema({
  title,
  description,
  path,
  image,
  author,
  datePublished,
  category,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  author?: string;
  datePublished?: string;
  category?: string;
}) {
  const absImage = toAbsoluteUrl(image);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url: toAbsoluteUrl(path),
    mainEntityOfPage: toAbsoluteUrl(path),
    ...(absImage ? { image: absImage } : {}),
    ...(category ? { articleSection: category } : {}),
    ...(datePublished ? { datePublished } : {}),
    author: {
      '@type': 'Person',
      name: author || 'Santa Towing Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Santa Towing & Garage Services Ltd.',
      url: SITE_URL,
    },
  };
}

export function buildBreadcrumbSchema(items: Array<{ label: string; path?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      ...items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 2,
        name: item.label,
        ...(item.path ? { item: toAbsoluteUrl(item.path) } : {}),
      })),
    ],
  };
}
