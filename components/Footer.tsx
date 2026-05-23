"use client";

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-12 mb-12 md:mb-16">
          {/* Contact Information */}
          <div id="contact">
            <h3 className="text-2xl md:text-3xl font-light mb-6 md:mb-8 tracking-tight">Get in Touch</h3>
            <div className="space-y-5 md:space-y-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-800/20 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium mb-1 text-white text-sm md:text-base">Address</p>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    Kulaghar Farm Stay<br />
                    Aldona Village, North Goa<br />
                    Goa 403508, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-800/20 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium mb-1 text-white text-sm md:text-base">Phone</p>
                  <a
                    href="tel:+919876543210"
                    className="text-gray-300 hover:text-green-400 transition-colors text-sm md:text-base"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-800/20 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium mb-1 text-white text-sm md:text-base">Email</p>
                  <a
                    href="mailto:info@kulagharfarmstay.com"
                    className="text-gray-300 hover:text-green-400 transition-colors text-sm md:text-base"
                  >
                    info@kulagharfarmstay.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-800/20 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium mb-1 md:mb-2 text-white text-sm md:text-base">Timings</p>
                  <p className="text-gray-300 text-xs md:text-sm">Day Out: 9:30 AM - 5:30 PM</p>
                  <p className="text-gray-300 text-xs md:text-sm">Night Stay: 6:30 PM - 9:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div id="location">
            <h3 className="text-2xl md:text-3xl font-light mb-6 md:mb-8 tracking-tight">Find Us</h3>
            <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl h-[300px] md:h-[400px] border border-gray-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3844.6534289284726!2d73.85!3d15.60!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDM2JzAwLjAiTiA3M8KwNTEnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Kulaghar Farm Stay Location"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 md:pt-8 text-center">
          <p className="text-gray-400 text-sm md:text-base">
            © {currentYear} Goan Kulaghar Stay. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs md:text-sm mt-1.5 md:mt-2">
            Experience authentic Goan hospitality in a peaceful farm setting
          </p>
        </div>
      </div>
    </footer>
  );
}