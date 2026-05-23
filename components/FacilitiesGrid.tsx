import Image from "next/image";
import { Waves, Home, Users, TreePine } from "lucide-react";

export function FacilitiesGrid() {
  const facilities = [
    {
      icon: Waves,
      title: "Swimming Pool",
      description: "Private pool exclusively for your group",
    },
    {
      icon: Home,
      title: "1 RK House with Terrace",
      description: "Comfortable stay with scenic views",
    },
    {
      icon: TreePine,
      title: "Authentic Goan Vibe",
      description: "Experience traditional kulaghar life",
    },
    {
      icon: Users,
      title: "Max 15 Guests",
      description: "Perfect for families and groups",
    },
  ];

  const images = [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    "https://images.unsplash.com/photo-1622003842218-e2eba033a4eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  ];

  return (
    <div className="py-16 md:py-24 px-4 md:px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl lg:text-6xl text-gray-900 mb-3 md:mb-4 font-light tracking-tight">
            Our Facilities
          </h2>
          <div className="w-16 md:w-20 h-1 bg-green-800 mx-auto"></div>
        </div>

        {/* Image Grid */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <Image
                src={image}
                alt={`Facility ${index + 1}`}
                fill
                unoptimized
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>

        {/* Facilities Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-16 md:mt-20">
          {facilities.map((facility, index) => (
            <div key={index} className="text-center group">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 bg-green-800/10 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-green-800 transition-colors duration-300">
                <facility.icon className="w-7 h-7 md:w-8 md:h-8 text-green-800 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                {facility.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-[250px] mx-auto md:max-w-none">
                {facility.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}