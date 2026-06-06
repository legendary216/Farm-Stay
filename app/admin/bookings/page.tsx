"use client";

import { useState, useMemo } from 'react';
import { MoreVertical, CheckCircle2, Search, Calendar as CalendarIcon, IndianRupee } from 'lucide-react';

type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface Booking {
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

const initialBookings: Booking[] = [
  {
    id: 'BKG-001',
    guestName: 'Rahul Sharma',
    guestPhone: '+91 98765 43210',
    bookingDate: '2026-06-06',
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
    bookingDate: '2026-06-06',
    slotType: 'Night Stay',
    guestCount: 2,
    totalAmount: 6000,
    paidAmount: 6000,
    status: 'COMPLETED',
  },
  {
    id: 'BKG-003',
    guestName: 'Amit Kumar',
    guestPhone: '+91 99887 76655',
    bookingDate: '2026-07-15', // July booking for testing the filter
    slotType: 'Day Out',
    guestCount: 10,
    totalAmount: 10000,
    paidAmount: 1500,
    status: 'CONFIRMED',
  }
];

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  
  // 1. New State for Search and Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Generate a list of unique months from the existing data for the dropdown
  const availableMonths = useMemo(() => {
    const months = new Set(bookings.map(b => b.bookingDate.substring(0, 7))); // Extracts YYYY-MM
    return Array.from(months).sort().reverse();
  }, [bookings]);

  // 2. The Filter Engine
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Check search match
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        booking.guestName.toLowerCase().includes(searchLower) ||
        booking.guestPhone.includes(searchLower);
      
      // Check month match
      const matchesMonth = selectedMonth === 'all' || booking.bookingDate.startsWith(selectedMonth);

      return matchesSearch && matchesMonth;
    });
  }, [bookings, searchQuery, selectedMonth]);

  // 3. The Revenue Math Engine
  const { expectedRevenue, collectedRevenue } = useMemo(() => {
    return filteredBookings.reduce(
      (totals, booking) => {
        // Exclude cancelled bookings from revenue expectations
        if (booking.status !== 'CANCELLED') {
          totals.expectedRevenue += booking.totalAmount;
          totals.collectedRevenue += booking.paidAmount;
        }
        return totals;
      },
      { expectedRevenue: 0, collectedRevenue: 0 }
    );
  }, [filteredBookings]);

  // 1-click Collect Balance function
  const handleCollectBalance = (id: string) => {
    setBookings(currentBookings => 
      currentBookings.map(booking => {
        if (booking.id === id) {
          return {
            ...booking,
            paidAmount: booking.totalAmount,
            status: 'COMPLETED'
          };
        }
        return booking;
      })
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Format month string (e.g., "2026-06" to "June 2026")
  const formatMonthName = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header & Controls Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Bookings</h1>
          <p className="text-gray-600">Manage arrivals, collections, and history.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
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
          
          {/* Month Selector */}
          <div className="relative w-full sm:w-48">
            <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-800/20 focus:border-green-800 transition-all w-full appearance-none cursor-pointer"
            >
              <option value="all">All Time</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {formatMonthName(month)}
                </option>
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                  
                  {/* Guest Details Column */}
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{booking.guestName}</p>
                    <p className="text-sm text-gray-500">{booking.guestPhone}</p>
                  </td>

                  {/* Schedule Column */}
                  <td className="p-4">
                    <p className="font-medium text-gray-900">
                      {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.slotType} • {booking.guestCount} Guests
                    </p>
                  </td>

                  {/* Payment Column */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-gray-900">
                        ₹{booking.paidAmount.toLocaleString('en-IN')} <span className="text-gray-400 font-normal">/ ₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      
                      {/* Conditional Collect Button */}
                      {booking.paidAmount < booking.totalAmount && (
                        <button 
                          onClick={() => handleCollectBalance(booking.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-lg text-xs font-medium transition-colors border border-green-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Collect
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Operational Status Column */}
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="p-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State Fallback */}
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