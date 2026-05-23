"use client";

import { MessageCircle } from 'lucide-react';

export function WhatsappBUtton() {
  const handleWhatsAppClick = () => {
    const phoneNumber = '9834662449';
    const message = encodeURIComponent('Hi! I would like to inquire about booking the Goan Kulaghar Stay.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-8 right-8 z-50 bg-green-500 hover:bg-green-600 text-white p-5 rounded-full shadow-2xl transition-all hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />

      {/* Tooltip */}
      <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        Chat with us
      </span>

      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
    </button>
  );
}