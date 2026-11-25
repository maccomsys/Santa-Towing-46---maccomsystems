import React from 'react';
import { Helmet } from 'react-helmet-async';
import { heavyDutyRecoveryVehicle } from '@/assets/images';
import { safeJsonLdStringify } from '@/lib/security';
import { SITE_URL, toAbsoluteUrl } from '@/lib/seoSchemas';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
  keywords?: string | string[];
  type?: 'website' | 'article' | 'product';
  image?: string;
  imageAlt?: string;
  schema?:
    | Record<string, unknown>
    | Array<Record<string, unknown> | null | undefined>
    | null;
}

export default function SEO({
  title,
  description,
  canonical,
  noindex = false,
  keywords,
  type = 'website',
  image,
  imageAlt,
  schema,
}: SEOProps) {
  const fullCanonical = canonical
    ? `${SITE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
    : undefined;
  const resolvedImage = toAbsoluteUrl(image || heavyDutyRecoveryVehicle);
  const resolvedAlt = imageAlt || title;

  const schemaItems = (Array.isArray(schema) ? schema : schema ? [schema] : []).filter(
    (item): item is Record<string, unknown> => Boolean(item)
  );

  const keywordsContent = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywordsContent && keywordsContent.trim().length > 0 && (
        <meta name="keywords" content={keywordsContent} />
      )}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}
      <meta
        name="robots"
        content={
          noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        }
      />

      {/* Open Graph */}
      <meta property="og:site_name" content="Santa Towing" />
      <meta property="og:locale" content="en_GH" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      {resolvedImage && <meta property="og:image" content={resolvedImage} />}
      {resolvedImage && <meta property="og:image:alt" content={resolvedAlt} />}

      {/* Twitter / X Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {resolvedImage && <meta name="twitter:image" content={resolvedImage} />}
      {resolvedImage && <meta name="twitter:image:alt" content={resolvedAlt} />}

      {/* Schema.org JSON-LD */}
      {schemaItems.map((item, idx) => (
        <script key={idx} type="application/ld+json">
          {safeJsonLdStringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
