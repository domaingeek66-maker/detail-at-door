import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/ServicesSection";
import { PortfolioTestimonials } from "@/components/PortfolioTestimonials";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ServicesSection />
      <PortfolioTestimonials />
      <Footer />
    </div>
  );
};

export default Index;
