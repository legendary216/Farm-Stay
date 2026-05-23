"use client";

import Image from "next/image";

export function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Swimming pool surrounded by lush greenery"
          fill
          priority
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <h1 className="text-5xl md:text-6xl lg:text-7xl text-white mb-6 font-light tracking-tight leading-tight">
          Experience a Peaceful<br />Goan Farm Stay
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-14 font-light">
          Private retreat for up to 15 guests
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 max-w-2xl mx-auto">
          <button
            onClick={() => scrollToSection('booking')}
            className="group relative bg-white hover:bg-gray-50 text-gray-900 px-8 py-5 rounded-2xl transition-all w-full sm:w-auto shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            <span className="block font-semibold text-lg mb-1">Book Day Out</span>
            <span className="block text-sm text-gray-600">9:30 AM - 5:30 PM</span>
          </button>
          <button
            onClick={() => scrollToSection('booking')}
            className="group relative bg-green-800 hover:bg-green-900 text-white px-8 py-5 rounded-2xl transition-all w-full sm:w-auto shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            <span className="block font-semibold text-lg mb-1">Book Night Stay</span>
            <span className="block text-sm text-white/90">6:30 PM - 9:00 AM</span>
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}