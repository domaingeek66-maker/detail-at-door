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
  title = "Car Detailing aan Huis | Cardetail Exclusief | Professioneel & Mobiel",
  description = "Premium car detailing aan huis in heel Nederland. Interieur & exterieur reiniging, ceramic coating, poetsen. Boek online met transparante prijzen. ⭐ 100% tevredenheid.",
  keywords = "car detailing aan huis, mobiele car detailing, auto poetsen, interieur reiniging auto, exterieur reiniging, ceramic coating, auto wassen aan huis, car detailing nederland, professioneel auto detailing",
  image = "https://cardetailexclusief.nl/logo-email.png",
  url = "https://cardetailexclusief.nl",
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
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="nl_NL" />
      <meta property="og:site_name" content="Cardetail Exclusief" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@cardetail.exclusief" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="geo.region" content="NL" />
      <meta name="geo.placename" content="Nederland" />
      <meta name="language" content="nl" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};