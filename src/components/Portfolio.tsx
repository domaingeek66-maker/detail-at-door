import portfolio1 from "@/assets/portfolio-1.jpeg";
import portfolio2 from "@/assets/portfolio-2.jpeg";
import portfolio3 from "@/assets/portfolio-3.jpeg";

const Portfolio = () => {
  const portfolioItems = [
    {
      id: 1,
      image: portfolio1,
      alt: "Volvo interieur detailing met bescherming",
      title: "Volvo Premium Detailing"
    },
    {
      id: 2,
      image: portfolio2,
      alt: "Porsche interieur behandeling",
      title: "Porsche Interior Care"
    },
    {
      id: 3,
      image: portfolio3,
      alt: "Volkswagen interieur reiniging",
      title: "Volkswagen Deep Clean"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Ons Werk
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bekijk onze recente projecten en ontdek de kwaliteit van ons detailing werk
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-semibold">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Portfolio };
