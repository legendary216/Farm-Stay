"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Ban, Trash2, CalendarCheck, AlertTriangle, X } from 'lucide-react';

// 1. Types
export interface BlockedDate {
  date: string;
  dayBlocked: boolean;
  nightBlocked: boolean;
  reason: string;
}

type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// Upgraded to match the financial data structure
export interface Booking {
  id: string;
  guestName: string;
  guestPhone: string;
  bookingDate: string;
  slotType: 'Day Out' | 'Night Stay';
  guestCount: number;
  totalAmount: number;
  paidAmount: number;
  status: BookingStatus;
}

// 2. Mock Data
const initialBlockedDates: BlockedDate[] = [
  {
    date: '2026-06-01',
    dayBlocked: true,
    nightBlocked: true,
    reason: 'Property maintenance',
  },
  {
    date: '2026-06-05',
    dayBlocked: false,
    nightBlocked: true,
    reason: 'Family event',
  },
];

const initialBookings: Booking[] = [
  {
    id: 'BKG-001',
    guestName: 'Rahul Sharma',
    guestPhone: '+91 98765 43210',
    bookingDate: '2026-06-12',
    slotType: 'Day Out',
    guestCount: 4,
    totalAmount: 4000,
    paidAmount: 1500,
    status: 'CONFIRMED',
  },
  {
    id: 'BKG-002',
    guestName: 'Priya Patel',
    guestPhone: '+91 91234 56789',
    bookingDate: '2026-06-15',
    slotType: 'Night Stay',
    guestCount: 2,
    totalAmount: 6000,
    paidAmount: 6000,
    status: 'CONFIRMED',
  }
];

export default function CalendarManagement() {
  // State Management
  const [currentMonth, setCurrentMonth] = useState(new Date('2026-06-01'));
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(initialBlockedDates);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');
  
  // Financial Cancellation Modal State
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [refundDecision, setRefundDecision] = useState<'refund' | 'keep' | null>(null);

  // Calendar Math
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  // Navigation Logic
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
  };

  const getDateKey = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  // Data Merging Engines
  const getBlockedStatus = (dateKey: string) => blockedDates.find((b) => b.date === dateKey);
  const getActiveBookings = (dateKey: string) => bookings.filter((b) => b.bookingDate === dateKey && b.status !== 'CANCELLED');

  // Administrative Blocking Logic
  const blockSlot = (slotType: 'day' | 'night' | 'both') => {
    if (!selectedDate || !blockReason.trim()) return;
    const existingBlock = blockedDates.find((b) => b.date === selectedDate);

    if (existingBlock) {
      setBlockedDates(blockedDates.map((b) =>
        b.date === selectedDate ? {
          ...b,
          dayBlocked: slotType === 'both' || slotType === 'day' ? true : b.dayBlocked,
          nightBlocked: slotType === 'both' || slotType === 'night' ? true : b.nightBlocked,
          reason: blockReason,
        } : b
      ));
    } else {
      setBlockedDates([...blockedDates, {
        date: selectedDate,
        dayBlocked: slotType === 'both' || slotType === 'day',
        nightBlocked: slotType === 'both' || slotType === 'night',
        reason: blockReason,
      }]);
    }
    setBlockReason('');
  };

  const unblockDate = (dateKey: string) => {
    setBlockedDates(blockedDates.filter((b) => b.date !== dateKey));
  };

  // Financial Cancellation Logic
  const confirmCancellation = () => {
    if (!bookingToCancel || !refundDecision) return;
    
    setBookings(currentBookings => 
      currentBookings.map(b => b.id === bookingToCancel.id ? { 
        ...b, 
        status: 'CANCELLED',
        paidAmount: refundDecision === 'refund' ? 0 : b.paidAmount
      } : b)
    );
    
    setBookingToCancel(null);
    setRefundDecision(null);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedBlockedDate = selectedDate ? getBlockedStatus(selectedDate) : null;
  const selectedDateBookings = selectedDate ? getActiveBookings(selectedDate) : [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* Financial Cancellation Modal */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Cancel Booking</h3>
            <p className="text-gray-600 mb-6 text-sm">
              You are cancelling the booking for <span className="font-semibold text-gray-900">{bookingToCancel.guestName}</span>. 
              They have currently paid <span className="font-semibold text-gray-900">₹{bookingToCancel.paidAmount.toLocaleString('en-IN')}</span>. 
              Please select how to handle their payment.
            </p>
            
            <div className="space-y-3 mb-8">
              {/* Option 1: Refund */}
              <button 
                onClick={() => setRefundDecision('refund')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  refundDecision === 'refund' 
                    ? 'border-red-600 bg-red-50' 
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900 mb-1">Refund Payment</div>
                <div className="text-xs text-gray-500">Return ₹{bookingToCancel.paidAmount.toLocaleString('en-IN')} to the guest. Revenue will be deducted.</div>
              </button>

              {/* Option 2: No Refund */}
              <button 
                onClick={() => setRefundDecision('keep')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  refundDecision === 'keep' 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900 mb-1">No Refund (Penalty)</div>
                <div className="text-xs text-gray-500">Keep ₹{bookingToCancel.paidAmount.toLocaleString('en-IN')}. Revenue will remain in the system.</div>
              </button>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setBookingToCancel(null); setRefundDecision(null); }}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={confirmCancellation}
                disabled={!refundDecision}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Calendar & Availability</h1>
        <p className="text-gray-600">Manage blocks and schedule overview</p>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* LEFT COLUMN: Calendar Widget */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-8">
            <button onClick={previousMonth} className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h3 className="text-xl font-medium text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button onClick={nextMonth} className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-3">
            {dayNames.map((day) => <div key={day} className="text-center font-medium text-gray-400 text-sm py-2">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {Array.from({ length: startingDayOfWeek }).map((_, index) => <div key={`empty-${index}`} />)}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateKey = getDateKey(day);
              const blockedStatus = getBlockedStatus(dateKey);
              const dayBookings = getActiveBookings(dateKey);
              const isSelected = selectedDate === dateKey;
              const hasBookings = dayBookings.length > 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`
                    aspect-square p-2 md:p-3 rounded-xl flex flex-col items-center justify-center transition-all font-medium relative border-2
                    ${isSelected ? 'bg-green-50 border-green-800 text-green-900' : 'border-transparent text-gray-700'}
                    ${blockedStatus && !isSelected ? 'bg-red-50/50 border-red-100' : ''}
                    ${hasBookings && !isSelected ? 'border-green-200 bg-green-50/30' : ''}
                    ${!blockedStatus && !hasBookings && !isSelected ? 'hover:bg-stone-50' : ''}
                  `}
                >
                  <span className="block mb-1">{day}</span>
                  
                  {/* Status Indicators */}
                  <div className="flex justify-center gap-1 h-1.5 w-full absolute bottom-2">
                    {hasBookings && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                    {blockedStatus?.dayBlocked && <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                    {blockedStatus?.nightBlocked && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-6 text-sm justify-center">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Active Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Day Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
              <span className="text-gray-600">Night Blocked</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Context Panel */}
        <div className="space-y-6">
          {selectedDate ? (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="font-medium text-lg text-gray-900 mb-6 pb-4 border-b border-gray-100">
                {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>

              {/* Active Bookings Section */}
              {selectedDateBookings.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Scheduled Arrivals</h4>
                  {selectedDateBookings.map(booking => (
                    <div key={booking.id} className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{booking.guestName}</p>
                          <p className="text-sm text-gray-600">{booking.slotType} • {booking.guestCount} Guests</p>
                          <p className="text-xs text-gray-500 mt-1">{booking.guestPhone}</p>
                        </div>
                        <button 
                          onClick={() => setBookingToCancel(booking)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Administrative Block Section */}
              <div className="mb-2">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Availability Controls</h4>
                {selectedBlockedDate ? (
                  <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Ban className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-900 text-sm">Currently Blocked</span>
                      </div>
                      <button onClick={() => unblockDate(selectedDate)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                    </div>
                    <p className="text-sm text-red-600/80">Reason: {selectedBlockedDate.reason}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Block reason (e.g., Maintenance)"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-green-800 focus:outline-none text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => blockSlot('day')} disabled={!blockReason.trim()} className="flex items-center justify-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium">
                        <Sun className="w-4 h-4" /> Day
                      </button>
                      <button onClick={() => blockSlot('night')} disabled={!blockReason.trim()} className="flex items-center justify-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium">
                        <Moon className="w-4 h-4" /> Night
                      </button>
                    </div>
                    <button onClick={() => blockSlot('both')} disabled={!blockReason.trim()} className="w-full p-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
                      Block Entire Day
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center h-48">
              <CalendarCheck className="w-8 h-8 text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Select a date to view bookings or block slots.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}