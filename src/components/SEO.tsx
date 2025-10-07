import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export const SEO = ({
  title = "Cardetail Exclusief - Premium Car Detailing aan Huis",
  description = "Exclusieve car detailing service bij u aan huis. Professionele behandeling van uw auto met transparante prijzen en WhatsApp bevestiging.",
  keywords = "car detailing, auto detailing, car wash, ceramic coating, interieur reiniging, exterieur reiniging, mobiele car detailing, car detailing aan huis",
  image = "https://lovable.dev/opengraph-image-p98pqg.png",
  url = "https://cardetail-exclusief.nl",
  type = "website",
  structuredData,
}: SEOProps) => {
  const fullTitle = title.includes("Cardetail Exclusief") ? title : `${title} | Cardetail Exclusief`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="nl_NL" />
      <meta property="og:site_name" content="Cardetail Exclusief" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};