"use client";

import { useState, useEffect } from 'react';
import { Leaf, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false); // Close mobile menu after clicking
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen ? 'bg-white shadow-sm' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 md:py-5 flex items-center justify-between">
        {/* Left: Logo */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-2.5 md:gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-green-700 to-green-800 rounded-full flex items-center justify-center shadow-md">
            <Leaf className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold text-base md:text-lg text-gray-900 tracking-tight leading-tight">
              Goan Kulaghar Stay
            </span>
            <span className="text-[10px] md:text-xs text-gray-500 tracking-wide">
              North Goa
            </span>
          </div>
        </button>

        {/* Center: Desktop Navigation Links */}
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
            onClick={scrollToBottom}
            className="text-gray-600 hover:text-green-800 transition-colors text-[15px] font-medium"
          >
            Location & Contact
          </button>
        </div>

        {/* Right: Actions (Book Now + Mobile Menu Toggle) */}
        <div className="flex items-center gap-3 md:gap-0">
          <button
            onClick={() => scrollToSection('booking')}
            className="bg-green-800 hover:bg-green-900 text-white px-5 py-2 md:px-7 md:py-2.5 rounded-full transition-all font-medium text-sm md:text-[15px] shadow-md hover:shadow-lg"
          >
            Book Now
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden text-gray-700 hover:text-green-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => scrollToSection('facilities')}
            className="text-left text-gray-700 hover:text-green-800 py-2 text-base font-medium transition-colors"
          >
            Gallery & Facilities
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-left text-gray-700 hover:text-green-800 py-2 text-base font-medium transition-colors"
          >
            Rules
          </button>
          <button
            onClick={scrollToBottom}
            className="text-left text-gray-700 hover:text-green-800 py-2 text-base font-medium transition-colors"
          >
            Location & Contact
          </button>
        </div>
      )}
    </nav>
  );
}