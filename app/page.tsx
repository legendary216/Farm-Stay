import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FacilitiesGrid } from "@/components/FacilitiesGrid";
import { PricingAndRules } from "@/components/PricingAndRules";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Footer } from "@/components/Footer";
import { WhatsappBUtton } from "@/components/WhatsappBUtton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen scroll-smooth">
      <Navbar />
      
      <main className="flex-1">
        <section id="hero">
          <HeroSection />
        </section>
        
        <section id="facilities">
          <FacilitiesGrid />
        </section>
        
        <section id="pricing">
          <PricingAndRules />
        </section>
        
        <section id="booking">
          <Suspense fallback={
            <div className="py-24 px-6 text-center text-gray-500 min-h-[400px] flex items-center justify-center">
              <p className="text-lg">Loading calendar...</p>
            </div>
          }>
            <BookingCalendar />
          </Suspense>
        </section>
      </main>
      <WhatsappBUtton />
      <Footer />
    </div>
  );
}