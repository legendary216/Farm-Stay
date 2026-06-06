"use client";

import { useState, useEffect, useMemo } from 'react';
import { MoreVertical, CheckCircle2, Search, Calendar as CalendarIcon, IndianRupee, AlertTriangle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// Upgraded Interface to match Supabase SQL schema exactly
interface Booking {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string;
  booking_date: string;
  slot_type: 'Day Out' | 'Night Stay';
  guest_count: number;
  total_amount: number;
  paid_amount: number;
  status: BookingStatus;
}

export default function BookingsManagement() {
  // Initialize Supabase Client
  const supabase = createClient();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // UI Action State
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  
  // Cancellation Modal State
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [refundDecision, setRefundDecision] = useState<'refund' | 'keep' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- DATABASE FETCH LOGIC ---
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
    } else if (data) {
      setBookings(data as Booking[]);
    }
    setIsLoading(false);
  };

  // --- DATABASE MUTATION LOGIC ---
  const handleCollectBalance = async (id: string, totalAmount: number) => {
    // 1. Update Supabase
    const { error } = await supabase
      .from('bookings')
      .update({ 
        paid_amount: totalAmount, 
        status: 'COMPLETED' 
      })
      .eq('id', id);

    if (error) {
      console.error("Failed to collect balance:", error);
      return;
    }

    // 2. Update Local UI State
    setBookings(currentBookings => 
      currentBookings.map(booking => {
        if (booking.id === id) {
          return { ...booking, paid_amount: totalAmount, status: 'COMPLETED' };
        }
        return booking;
      })
    );
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel || !refundDecision) return;
    setIsProcessing(true);

    const finalPaidAmount = refundDecision === 'refund' ? 0 : bookingToCancel.paid_amount;

    // 1. Update Supabase
    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'CANCELLED',
        paid_amount: finalPaidAmount
      })
      .eq('id', bookingToCancel.id);

    if (error) {
      console.error("Failed to cancel booking:", error);
      setIsProcessing(false);
      return;
    }

    // 2. Update Local UI State
    setBookings(currentBookings => 
      currentBookings.map(booking => {
        if (booking.id === bookingToCancel.id) {
          return {
            ...booking,
            status: 'CANCELLED',
            paid_amount: finalPaidAmount
          };
        }
        return booking;
      })
    );

    // Reset modal state
    setBookingToCancel(null);
    setRefundDecision(null);
    setIsProcessing(false);
  };

  // --- FILTERING & MATH ENGINE ---
  const availableMonths = useMemo(() => {
    const months = new Set(bookings.map(b => b.booking_date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        booking.guest_name.toLowerCase().includes(searchLower) ||
        booking.guest_phone.includes(searchLower);
      const matchesMonth = selectedMonth === 'all' || booking.booking_date.startsWith(selectedMonth);
      return matchesSearch && matchesMonth;
    });
  }, [bookings, searchQuery, selectedMonth]);

  const { expectedRevenue, collectedRevenue } = useMemo(() => {
    return filteredBookings.reduce(
      (totals, booking) => {
        if (booking.status !== 'CANCELLED') {
          totals.expectedRevenue += Number(booking.total_amount);
        }
        totals.collectedRevenue += Number(booking.paid_amount);
        return totals;
      },
      { expectedRevenue: 0, collectedRevenue: 0 }
    );
  }, [filteredBookings]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 text-green-800 animate-spin" />
        <p className="text-gray-500 font-medium">Loading ledger data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* Financial Cancellation Modal */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Cancel Booking</h3>
            <p className="text-gray-600 mb-6 text-sm">
              You are cancelling the booking for <span className="font-semibold text-gray-900">{bookingToCancel.guest_name}</span>. 
              They have currently paid <span className="font-semibold text-gray-900">₹{Number(bookingToCancel.paid_amount).toLocaleString('en-IN')}</span>. 
              Please select how to handle their payment.
            </p>
            
            <div className="space-y-3 mb-8">
              <button 
                onClick={() => setRefundDecision('refund')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  refundDecision === 'refund' 
                    ? 'border-red-600 bg-red-50' 
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900 mb-1">Refund Payment</div>
                <div className="text-xs text-gray-500">Return ₹{Number(bookingToCancel.paid_amount).toLocaleString('en-IN')} to the guest. Revenue will be deducted.</div>
              </button>

              <button 
                onClick={() => setRefundDecision('keep')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  refundDecision === 'keep' 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900 mb-1">No Refund (Penalty)</div>
                <div className="text-xs text-gray-500">Keep ₹{Number(bookingToCancel.paid_amount).toLocaleString('en-IN')}. Revenue will remain in the system.</div>
              </button>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => { setBookingToCancel(null); setRefundDecision(null); }}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={handleCancelBooking}
                disabled={!refundDecision || isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Bookings</h1>
          <p className="text-gray-600">Manage arrivals, collections, and history.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search guests or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all w-full"
            />
          </div>
          
          <div className="relative w-full sm:w-48">
            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all w-full appearance-none cursor-pointer"
            >
              <option value="all">All Time</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{formatMonthName(month)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Expected Revenue</p>
            <p className="text-2xl font-semibold text-gray-900">₹{expectedRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Cash Collected</p>
            <p className="text-2xl font-semibold text-green-700">₹{collectedRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-medium">
                <th className="p-4 font-medium">Guest Details</th>
                <th className="p-4 font-medium">Schedule</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                  
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{booking.guest_name}</p>
                    <p className="text-sm text-gray-500">{booking.guest_phone}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-medium text-gray-900">
                      {new Date(booking.booking_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">{booking.slot_type} • {booking.guest_count} Guests</p>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-gray-900">
                        ₹{Number(booking.paid_amount).toLocaleString('en-IN')} <span className="text-gray-400 font-normal">/ ₹{Number(booking.total_amount).toLocaleString('en-IN')}</span>
                      </div>
                      
                      {Number(booking.paid_amount) < Number(booking.total_amount) && booking.status !== 'CANCELLED' && (
                        <button 
                          onClick={() => handleCollectBalance(booking.id, booking.total_amount)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-lg text-xs font-medium transition-colors border border-green-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Collect
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>

                  <td className="p-4 text-right relative">
                    <button 
                      onClick={() => setOpenActionId(openActionId === booking.id ? null : booking.id)}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Action Dropdown Menu */}
                    {openActionId === booking.id && (
                      <div className="absolute right-8 top-10 w-36 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden z-10 text-left">
                        {booking.status !== 'CANCELLED' ? (
                          <button 
                            onClick={() => {
                              setBookingToCancel(booking);
                              setOpenActionId(null);
                            }}
                            className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" /> Cancel Booking
                          </button>
                        ) : (
                          <div className="px-4 py-2.5 text-sm text-gray-400">No actions available</div>
                        )}
                      </div>
                    )}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBookings.length === 0 && (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
            <Search className="w-8 h-8 text-gray-300" />
            <p>No bookings match your current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}