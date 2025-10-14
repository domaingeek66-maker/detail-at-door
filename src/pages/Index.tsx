import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/ServicesSection";
import { BeforeAfterSection } from "@/components/BeforeAfterSection";
import { PortfolioTestimonials } from "@/components/PortfolioTestimonials";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { CookieConsent } from "@/components/CookieConsent";

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Cardetail Exclusief",
    "description": "Premium car detailing service aan huis in heel Nederland. Professionele interieur & exterieur reiniging, ceramic coating en meer.",
    "url": "https://cardetailexclusief.nl",
    "telephone": "+31612345678",
    "priceRange": "€€",
    "image": "https://cardetailexclusief.nl/logo-email.png",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NL",
      "addressRegion": "Nederland"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "addressCountry": "NL"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "08:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://www.instagram.com/cardetail.exclusief"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "100"
    }
  };

  return (
    <>
      <SEO structuredData={structuredData} />
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <ServicesSection />
          <BeforeAfterSection />
          <PortfolioTestimonials />
        </main>
        <Footer />
        <CookieConsent />
      </div>
    </>
  );
};

export default Index;
