"use client";

import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        {/* Left: Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center shadow-md">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-lg text-gray-900 tracking-tight">Goan Kulaghar Stay</span>
            <span className="text-xs text-gray-500 tracking-wide">North Goa</span>
          </div>
        </button>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          <button
            onClick={() => scrollToSection('facilities')}
            className="text-gray-600 hover:text-green-800 transition-colors text-[15px] font-medium"
          >
            Gallery & Facilities
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-gray-600 hover:text-green-800 transition-colors text-[15px] font-medium"
          >
            Rules
          </button>
          <button
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="text-gray-600 hover:text-green-800 transition-colors text-[15px] font-medium"
          >
            Location & Contact
          </button>
        </div>

        {/* Right: Book Now Button */}
        <button
          onClick={() => scrollToSection('booking')}
          className="bg-green-800 hover:bg-green-900 text-white px-7 py-2.5 rounded-full transition-all font-medium text-[15px] shadow-md hover:shadow-lg"
        >
          Book Now
        </button>
      </div>
    </nav>
  );
}