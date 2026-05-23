"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronLeft, ChevronRight, Sun, Moon, Users, CalendarCheck } from 'lucide-react';

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [bookedSlots, setBookedSlots] = useState<Record<string, BookingSlot>>({});

  // Fetch live availability from Supabase
  useEffect(() => {
    async function fetchAvailability() {
      // Calculate date range for the current calendar view
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_date, slot_type')
        .in('payment_status', ['confirmed', 'blocked'])
        .gte('booking_date', startOfMonth.toISOString().split('T')[0])
        .lte('booking_date', endOfMonth.toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      const activeBookings: Record<string, BookingSlot> = {};
      
      if (data) {
        data.forEach((row) => {
          const dateStr = row.booking_date;
          if (!activeBookings[dateStr]) {
            activeBookings[dateStr] = { day: false, night: false };
          }
          if (row.slot_type === 'day_out') activeBookings[dateStr].day = true;
          if (row.slot_type === 'night_stay') activeBookings[dateStr].night = true;
        });
      }
      
      setBookedSlots(activeBookings);
    }

    fetchAvailability();
  }, [currentMonth]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedSlot(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedSlot(null);
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
    
    // Auto-select first available slot based on database
    const defaultSlot: SlotType = !booking?.day ? 'day' : !booking?.night ? 'night' : 'day';

    setSelectedSlot({ date, type: defaultSlot });
  };

  const isSlotAvailable = (day: number, slot: SlotType): boolean => {
    const dateKey = getDateKey(day);
    const booking = bookedSlots[dateKey];
    if (!booking) return true;
    return !booking[slot];
  };

  const handleCheckout = () => {
    if (!selectedSlot || guestCount < 1 || guestCount > 15) return;

    alert(`Redirecting to payment gateway...\n\nBooking Details:\nDate: ${selectedSlot.date.toLocaleDateString()}\nSlot: ${selectedSlot.type === 'day' ? 'Day Out (9:30 AM - 5:30 PM)' : 'Night Stay (6:30 PM - 9:00 AM)'}\nGuests: ${guestCount}\nAdvance Payment: ₹1,500`);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="py-24 px-6 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-4 font-light tracking-tight">
            Check Availability
          </h2>
          <div className="w-20 h-1 bg-green-800 mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
          {/* Left: Calendar */}
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={previousMonth}
                className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h3 className="text-2xl font-medium text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={nextMonth}
                className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {dayNames.map(day => (
                <div key={day} className="text-center font-medium text-gray-500 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const isPast = isDatePast(day);
                const isSelected = selectedSlot?.date.getDate() === day &&
                  selectedSlot?.date.getMonth() === currentMonth.getMonth();
                
                // Determine visual state based on DB availability
                const isFullyBooked = !isSlotAvailable(day, 'day') && !isSlotAvailable(day, 'night');

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    disabled={isPast || isFullyBooked}
                    className={`
                      aspect-square p-3 rounded-xl text-center transition-all font-medium relative
                      ${isPast || isFullyBooked ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'hover:bg-green-50 cursor-pointer text-gray-700'}
                      ${isSelected ? 'bg-green-800 text-white hover:bg-green-900 shadow-md' : ''}
                    `}
                  >
                    {day}
                    {isFullyBooked && !isPast && (
                      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Booking Panel */}
          <div className="space-y-6">
            {selectedSlot ? (
              <>
                {/* Selected Date */}
                <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <CalendarCheck className="w-5 h-5 text-green-800" />
                    <h4 className="font-medium text-gray-900">Selected Date</h4>
                  </div>
                  <p className="text-lg text-gray-700">
                    {selectedSlot.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Slot Selection - Radio Style */}
                <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4">Select Time Slot</h4>

                  <div className="space-y-3">
                    {/* Day Out Radio */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedSlot.type === 'day'
                          ? 'border-green-800 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!isSlotAvailable(selectedSlot.date.getDate(), 'day') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        checked={selectedSlot.type === 'day'}
                        onChange={() => setSelectedSlot({ ...selectedSlot, type: 'day' })}
                        disabled={!isSlotAvailable(selectedSlot.date.getDate(), 'day')}
                        className="w-5 h-5 text-green-800 focus:ring-green-800"
                      />
                      <Sun className="w-5 h-5 text-amber-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Day Out</p>
                        <p className="text-sm text-gray-600">9:30 AM - 5:30 PM</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        isSlotAvailable(selectedSlot.date.getDate(), 'day')
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}>
                        {isSlotAvailable(selectedSlot.date.getDate(), 'day') ? 'Available' : 'Booked'}
                      </span>
                    </label>

                    {/* Night Stay Radio */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedSlot.type === 'night'
                          ? 'border-green-800 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!isSlotAvailable(selectedSlot.date.getDate(), 'night') ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        checked={selectedSlot.type === 'night'}
                        onChange={() => setSelectedSlot({ ...selectedSlot, type: 'night' })}
                        disabled={!isSlotAvailable(selectedSlot.date.getDate(), 'night')}
                        className="w-5 h-5 text-green-800 focus:ring-green-800"
                      />
                      <Moon className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Night Stay</p>
                        <p className="text-sm text-gray-600">6:30 PM - 9:00 AM</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        isSlotAvailable(selectedSlot.date.getDate(), 'night')
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}>
                        {isSlotAvailable(selectedSlot.date.getDate(), 'night') ? 'Available' : 'Booked'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Guest Count */}
                <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
                  <label className="flex items-center gap-3 mb-3 font-medium text-gray-900">
                    <Users className="w-5 h-5 text-green-800" />
                    Number of People (1-15)
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-800 focus:outline-none text-lg"
                  >
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Summary */}
                <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-3xl shadow-xl p-6 text-white">
                  <h4 className="font-medium mb-4 text-white/90">Payment Summary</h4>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">Total</span>
                      <span className="text-2xl font-semibold">₹3,000</span>
                    </div>
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/80">Pay Now (Advance)</span>
                        <span className="text-xl font-medium">₹1,500</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Balance at Farm</span>
                        <span className="text-xl font-medium">₹1,500</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={guestCount < 1 || guestCount > 15 || !isSlotAvailable(selectedSlot.date.getDate(), selectedSlot.type)}
                    className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-green-900 py-4 rounded-2xl font-semibold text-lg transition-colors shadow-lg"
                  >
                    Pay ₹1,500 Advance to Book
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-gray-200 min-h-[400px] flex items-center justify-center">
                <div>
                  <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Select a date from the calendar to continue</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}