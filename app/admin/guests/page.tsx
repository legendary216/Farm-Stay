"use client";

import { useState, useEffect, useMemo } from 'react';
import { Search, Download, Users, Calendar, UserCheck, Mail, Phone, CalendarDays, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// 1. Type Definitions
interface Booking {
  id: string;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string;
  booking_date: string;
  status: string;
}

interface Guest {
  id: string; // We will use their phone number as their unique CRM ID
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastVisit: string;
}

export default function GuestDirectory() {
  const supabase = createClient();
  
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- DATABASE FETCH & AGGREGATION ENGINE ---
  useEffect(() => {
    fetchAndAggregateGuests();
  }, []);

  const fetchAndAggregateGuests = async () => {
    setIsLoading(true);

    // 1. Fetch all non-cancelled bookings, ordered newest first
    const { data, error } = await supabase
      .from('bookings')
      .select('id, guest_name, guest_email, guest_phone, booking_date, status')
      .neq('status', 'CANCELLED')
      .order('booking_date', { ascending: false });

    if (error) {
      console.error("Error fetching CRM data:", error);
      setIsLoading(false);
      return;
    }

    if (data) {
      // 2. The Aggregation Engine (Group by Phone Number)
      const guestMap = new Map<string, Guest>();

      data.forEach((booking: Booking) => {
        const phone = booking.guest_phone;

        if (!guestMap.has(phone)) {
          // First time seeing this phone number (which is their newest booking due to the SQL order)
          guestMap.set(phone, {
            id: phone,
            name: booking.guest_name,
            email: booking.guest_email || 'No email provided',
            phone: phone,
            totalBookings: 1,
            lastVisit: booking.booking_date,
          });
        } else {
          // We have seen this guest before, just increment their lifetime booking count
          const existingGuest = guestMap.get(phone)!;
          existingGuest.totalBookings += 1;
        }
      });

      // Convert the Map back to a clean array for React to render
      setGuests(Array.from(guestMap.values()));
    }
    
    setIsLoading(false);
  };

  // --- SEARCH & FILTER ENGINE ---
  const filteredGuests = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return guests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(query) ||
        guest.email.toLowerCase().includes(query) ||
        guest.phone.includes(query)
    );
  }, [guests, searchQuery]);

  // --- MATHEMATICAL KPI ENGINE ---
  const kpis = useMemo(() => {
    return {
      totalGuests: filteredGuests.length,
      totalBookings: filteredGuests.reduce((sum, guest) => sum + guest.totalBookings, 0),
      repeatGuests: filteredGuests.filter((guest) => guest.totalBookings > 1).length,
    };
  }, [filteredGuests]);

  // --- CSV EXPORT LOGIC ---
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Total Bookings', 'Last Visit'];
    
    const csvData = filteredGuests.map(
      (g) => `"${g.name}","${g.email}","${g.phone}",${g.totalBookings},"${g.lastVisit}"`
    );
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Kulaghar_Guests_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 text-green-800 animate-spin" />
        <p className="text-gray-500 font-medium">Aggregating guest history...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Guest Directory</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={guests.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-800 hover:bg-green-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors shadow-sm w-fit"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Search Bar Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-green-800 focus:ring-1 focus:ring-green-800 focus:outline-none transition-all"
          />
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Showing {filteredGuests.length} of {guests.length} unique guests
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Guests</p>
            <p className="text-2xl font-semibold text-gray-900">{kpis.totalGuests}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-800 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
            <p className="text-2xl font-semibold text-gray-900">{kpis.totalBookings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Repeat Guests</p>
            <p className="text-2xl font-semibold text-gray-900">{kpis.repeatGuests}</p>
          </div>
        </div>
      </div>

      {/* Guest Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGuests.map((guest) => (
          <div key={guest.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-green-800 text-white rounded-full flex items-center justify-center font-semibold text-lg tracking-wide">
                {getInitials(guest.name)}
              </div>
              <div className="px-3 py-1 bg-green-50 text-green-800 text-xs font-medium rounded-full border border-green-100">
                {guest.totalBookings} {guest.totalBookings === 1 ? 'booking' : 'bookings'}
              </div>
            </div>

            {/* Guest Info */}
            <h3 className="text-lg font-medium text-gray-900 mb-4">{guest.name}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{guest.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{guest.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Last visit: {formatDate(guest.lastVisit)}</span>
              </div>
            </div>

          </div>
        ))}

        {/* Empty State Fallback */}
        {filteredGuests.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No guests found matching your search.</p>
          </div>
        )}
      </div>

    </div>
  );
}