"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ChevronLeft, ChevronRight, Sun, Moon, Users, CalendarCheck, ArrowLeft, User, Mail, Phone, Loader2 } from 'lucide-react';

type SlotType = 'day' | 'night';

interface BookingSlot {
  day: boolean;
  night: boolean;
}

interface SelectedSlot {
  date: Date;
  type: SlotType;
}

export function BookingCalendar() {
  const supabase = createClient();

  const [currentMonth, setCurrentMonth] = useState(new Date('2026-06-01'));
  const [isClient, setIsClient] = useState(false);
  
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [bookedSlots, setBookedSlots] = useState<Record<string, BookingSlot>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    setCurrentMonth(new Date()); 
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    async function fetchAvailability() {
      setIsLoading(true);
      
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const startStr = startOfMonth.toISOString().split('T')[0];
      const endStr = endOfMonth.toISOString().split('T')[0];

      const [bookingsRes, blocksRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('booking_date, slot_type')
          .in('status', ['CONFIRMED', 'COMPLETED']) 
          .gte('booking_date', startStr)
          .lte('booking_date', endStr),
        supabase
          .from('blocked_dates')
          .select('blocked_date, day_blocked, night_blocked')
          .gte('blocked_date', startStr)
          .lte('blocked_date', endStr)
      ]);

      const activeSlots: Record<string, BookingSlot> = {};
      
      if (bookingsRes.data) {
        bookingsRes.data.forEach((row) => {
          const dateStr = row.booking_date;
          if (!activeSlots[dateStr]) activeSlots[dateStr] = { day: false, night: false };
          if (row.slot_type === 'Day Out') activeSlots[dateStr].day = true; 
          if (row.slot_type === 'Night Stay') activeSlots[dateStr].night = true; 
        });
      }
      
      if (blocksRes.data) {
        blocksRes.data.forEach((row) => {
          const dateStr = row.blocked_date;
          if (!activeSlots[dateStr]) activeSlots[dateStr] = { day: false, night: false };
          if (row.day_blocked) activeSlots[dateStr].day = true;
          if (row.night_blocked) activeSlots[dateStr].night = true;
        });
      }
      
      setBookedSlots(activeSlots);
      setIsLoading(false);
    }

    fetchAvailability();
  }, [currentMonth, isClient]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedSlot(null);
    setCheckoutStep(1);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedSlot(null);
    setCheckoutStep(1);
  };

  const isDatePast = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDateKey = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const handleDateClick = (day: number) => {
    if (isDatePast(day)) return;

    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateKey = getDateKey(day);
    const booking = bookedSlots[dateKey];
    
    const defaultSlot: SlotType = !booking?.day ? 'day' : !booking?.night ? 'night' : 'day';

    setSelectedSlot({ date, type: defaultSlot });
    setCheckoutStep(1);
  };

  const isSlotAvailable = (day: number, slot: SlotType): boolean => {
    const dateKey = getDateKey(day);
    const booking = bookedSlots[dateKey];
    if (!booking) return true;
    return !booking[slot];
  };

  const isFormValid = customerDetails.name.trim() !== '' && 
                      customerDetails.email.trim() !== '' && 
                      customerDetails.phone.trim() !== '';

  const handleCheckout = () => {
    if (!selectedSlot || !isFormValid) return;
    alert(`Redirecting to payment gateway...\n\nName: ${customerDetails.name}\nEmail: ${customerDetails.email}\nPhone: ${customerDetails.phone}\nDate: ${selectedSlot.date.toLocaleDateString()}\nSlot: ${selectedSlot.type === 'day' ? 'Day Out' : 'Night Stay'}\nGuests: ${guestCount}\nAmount to Pay: ₹1,500 (Advance)`);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!isClient) return null; 

  return (
    <div className="py-16 md:py-24 px-4 md:px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl lg:text-6xl text-gray-900 mb-3 md:mb-4 font-light tracking-tight">
            Check Availability
          </h2>
          <div className="w-16 md:w-20 h-1 bg-green-800 mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-10">
          
          {/* Left: Calendar */}
          <div className="bg-white rounded-3xl shadow-lg p-5 md:p-8 border border-gray-100 h-fit">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <button onClick={previousMonth} className="p-2 md:p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              </button>
              <h3 className="text-xl md:text-2xl font-medium text-gray-900 flex items-center gap-2">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                {isLoading && <Loader2 className="w-4 h-4 text-green-800 animate-spin" />}
              </h3>
              <button onClick={nextMonth} className="p-2 md:p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 md:mb-3">
              {dayNames.map(day => (
                <div key={day} className="text-center font-medium text-gray-500 text-xs md:text-sm py-1 md:py-2">
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const isPast = isDatePast(day);
                
                // Determine Slot Availability
                const dayBooked = !isSlotAvailable(day, 'day');
                const nightBooked = !isSlotAvailable(day, 'night');
                const isFullyBooked = dayBooked && nightBooked;

                const isSelected = selectedSlot?.date.getDate() === day &&
                  selectedSlot?.date.getMonth() === currentMonth.getMonth();

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    disabled={isPast || isFullyBooked}
                    className={`
                      aspect-square p-1 sm:p-2 md:p-3 rounded-xl flex flex-col items-center justify-center transition-all font-medium relative text-sm md:text-base border-2
                      ${isSelected ? 'bg-green-800 border-green-800 text-white shadow-md' : 'border-transparent'}
                      ${isPast || isFullyBooked ? 'text-gray-300 cursor-not-allowed bg-gray-50' : !isSelected ? 'hover:bg-green-50 cursor-pointer text-gray-700' : ''}
                    `}
                  >
                    <span className={!isPast && !isFullyBooked && (dayBooked || nightBooked) ? "mb-1.5" : ""}>{day}</span>
                    
                    {/* Partial Booking Dots */}
                    {!isPast && !isFullyBooked && (dayBooked || nightBooked) && (
                      <div className="flex gap-1 absolute bottom-1.5">
                        {dayBooked && <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>}
                        {nightBooked && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Guest Calendar Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs md:text-sm justify-center text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Day Out Booked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Night Stay Booked</span>
              </div>
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="space-y-5 md:space-y-6">
            {!selectedSlot ? (
              <div className="bg-white rounded-3xl p-6 md:p-10 text-center border-2 border-dashed border-gray-200 min-h-[300px] md:min-h-[400px] flex items-center justify-center">
                <div>
                  <CalendarCheck className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <p className="text-gray-500 text-base md:text-lg">Select a date from the calendar to continue</p>
                </div>
              </div>
            ) : checkoutStep === 1 ? (
              <>
                <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <CalendarCheck className="w-5 h-5 text-green-800" />
                    <h4 className="font-medium text-gray-900">Selected Date</h4>
                  </div>
                  <p className="text-base md:text-lg text-gray-700">
                    {selectedSlot.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 border border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-3 md:mb-4">Select Time Slot</h4>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedSlot.type === 'day' ? 'border-green-800 bg-green-50' : 'border-gray-200 hover:border-gray-300'} ${!isSlotAvailable(selectedSlot.date.getDate(), 'day') ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input type="radio" name="slot" checked={selectedSlot.type === 'day'} onChange={() => setSelectedSlot({ ...selectedSlot, type: 'day' })} disabled={!isSlotAvailable(selectedSlot.date.getDate(), 'day')} className="w-4 h-4 md:w-5 md:h-5 text-green-800 focus:ring-green-800 flex-shrink-0" />
                      <Sun className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm md:text-base truncate">Day Out</p>
                        <p className="text-xs md:text-sm text-gray-600 truncate">9:30 AM - 5:30 PM</p>
                      </div>
                      <span className={`text-xs md:text-sm font-medium flex-shrink-0 ${isSlotAvailable(selectedSlot.date.getDate(), 'day') ? 'text-green-700' : 'text-gray-500'}`}>
                        {isSlotAvailable(selectedSlot.date.getDate(), 'day') ? 'Available' : 'Booked'}
                      </span>
                    </label>

                    <label className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedSlot.type === 'night' ? 'border-green-800 bg-green-50' : 'border-gray-200 hover:border-gray-300'} ${!isSlotAvailable(selectedSlot.date.getDate(), 'night') ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <input type="radio" name="slot" checked={selectedSlot.type === 'night'} onChange={() => setSelectedSlot({ ...selectedSlot, type: 'night' })} disabled={!isSlotAvailable(selectedSlot.date.getDate(), 'night')} className="w-4 h-4 md:w-5 md:h-5 text-green-800 focus:ring-green-800 flex-shrink-0" />
                      <Moon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm md:text-base truncate">Night Stay</p>
                        <p className="text-xs md:text-sm text-gray-600 truncate">6:30 PM - 9:00 AM</p>
                      </div>
                      <span className={`text-xs md:text-sm font-medium flex-shrink-0 ${isSlotAvailable(selectedSlot.date.getDate(), 'night') ? 'text-green-700' : 'text-gray-500'}`}>
                        {isSlotAvailable(selectedSlot.date.getDate(), 'night') ? 'Available' : 'Booked'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 border border-gray-100">
                  <label className="flex items-center gap-3 mb-3 font-medium text-gray-900">
                    <Users className="w-5 h-5 text-green-800 " /> Number of People (1-15)
                  </label>
                  <select value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-full px-3 py-2.5 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl focus:border-green-800 focus:outline-none text-base md:text-lg bg-white text-gray-900">
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setCheckoutStep(2)}
                  disabled={guestCount < 1 || guestCount > 15 || !isSlotAvailable(selectedSlot.date.getDate(), selectedSlot.type)}
                  className="w-full bg-green-800 hover:bg-green-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 md:py-4 rounded-2xl font-semibold text-base md:text-lg transition-colors shadow-lg"
                >
                  Proceed to Details
                </button>
              </>
            ) : (
              <>
                <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 border border-gray-100">
                  <button onClick={() => setCheckoutStep(1)} className="flex items-center text-gray-500 hover:text-green-800 mb-5 transition-colors font-medium">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Calendar
                  </button>
                  <div className="bg-stone-50 rounded-2xl p-4 mb-2">
                    <h4 className="font-medium text-gray-900 mb-1">Booking Summary</h4>
                    <p className="text-sm md:text-base text-gray-600">
                      {selectedSlot.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {selectedSlot.type === 'day' ? 'Day Out' : 'Night Stay'} • {guestCount} Guests
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg p-5 md:p-6 border border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4 md:mb-5">Guest Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 mb-2 text-sm font-medium "><User className="w-4 h-4 text-green-800"/> Full Name</label>
                     <input type="text" required value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-colors" placeholder="e.g. John Doe" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700"><Mail className="w-4 h-4 text-green-800"/> Email Address</label>
                      <input type="email" required value={customerDetails.email} onChange={e => setCustomerDetails({...customerDetails, email: e.target.value})} className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-colors" placeholder="e.g. john@example.com" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700"><Phone className="w-4 h-4 text-green-800"/> Phone Number</label>
                     <input type="tel" required value={customerDetails.phone} onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})} className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border-2 border-gray-200 focus:border-green-800 focus:outline-none transition-colors" placeholder="e.g. +91 98765 43210" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-3xl shadow-xl p-5 md:p-6 text-white">
                  <h4 className="font-medium mb-3 md:mb-4 text-white/90">Payment Summary</h4>
                  <div className="space-y-3 mb-5 md:mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Total</span>
                      <span className="text-xl md:text-2xl font-semibold">₹3,000</span>
                    </div>
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm md:text-base text-white/80">Pay Now (Advance)</span>
                        <span className="text-lg md:text-xl font-medium">₹1,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm md:text-base text-white/80">Balance at Farm</span>
                        <span className="text-lg md:text-xl font-medium">₹1,500</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={!isFormValid}
                    className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-green-900 py-3 md:py-4 rounded-2xl font-semibold text-base md:text-lg transition-colors shadow-lg"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}