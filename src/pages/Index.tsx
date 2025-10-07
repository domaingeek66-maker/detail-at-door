import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/ServicesSection";
import { PortfolioTestimonials } from "@/components/PortfolioTestimonials";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const Index = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Cardetail Exclusief",
    "description": "Premium car detailing service aan huis",
    "url": "https://cardetail-exclusief.nl",
    "telephone": "+31612345678",
    "priceRange": "€€",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "NL"
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
          <PortfolioTestimonials />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
