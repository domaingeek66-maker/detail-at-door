import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { Skeleton } from "./ui/skeleton";

export const BeforeAfterSection = () => {
  const { data: items, isLoading } = useQuery({
    queryKey: ["before-after-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("before_after_items")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="space-y-16">
            <Skeleton className="w-full max-w-4xl mx-auto aspect-[16/10] rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-secondary/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Voor & Na Resultaten</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Zie het verschil dat onze professionele detailing maakt
          </p>
        </div>
        
        <div className="space-y-16">
          {items.map((item) => (
            <BeforeAfterSlider
              key={item.id}
              title={item.title}
              beforeImage={item.before_image_url}
              afterImage={item.after_image_url}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
