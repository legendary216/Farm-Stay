"use client";

import { useState, useMemo } from 'react';
import { Search, Download, Users, Calendar, UserCheck, Mail, Phone, CalendarDays } from 'lucide-react';

// 1. Type Definitions
interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastVisit: string;
}

// 2. Mock Data (Engineered to match your exact KPI screenshot: 5 Guests, 11 Bookings, 3 Repeat)
const initialGuests: Guest[] = [
  {
    id: 'GST-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    phone: '+91 98765 43210',
    totalBookings: 3,
    lastVisit: 'May 25, 2026',
  },
  {
    id: 'GST-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 98765 43211',
    totalBookings: 2,
    lastVisit: 'May 26, 2026',
  },
  {
    id: 'GST-003',
    name: 'Amit Patel',
    email: 'amit.patel@email.com',
    phone: '+91 98765 43212',
    totalBookings: 1,
    lastVisit: 'May 27, 2026',
  },
  {
    id: 'GST-004',
    name: 'Sunita Verma',
    email: 'sunita.v@email.com',
    phone: '+91 98765 43213',
    totalBookings: 4,
    lastVisit: 'Jun 02, 2026',
  },
  {
    id: 'GST-005',
    name: 'Vikram Singh',
    email: 'vikram.s@email.com',
    phone: '+91 98765 43214',
    totalBookings: 1,
    lastVisit: 'Jun 05, 2026',
  }
];

export default function GuestDirectory() {
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Search & Filter Engine
  const filteredGuests = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return initialGuests.filter(
      (guest) =>
        guest.name.toLowerCase().includes(query) ||
        guest.email.toLowerCase().includes(query) ||
        guest.phone.includes(query)
    );
  }, [searchQuery]);

  // 4. Mathematical KPI Engine
  const kpis = useMemo(() => {
    return {
      totalGuests: filteredGuests.length,
      totalBookings: filteredGuests.reduce((sum, guest) => sum + guest.totalBookings, 0),
      repeatGuests: filteredGuests.filter((guest) => guest.totalBookings > 1).length,
    };
  }, [filteredGuests]);

  // 5. CSV Export Logic (Client-side generation)
  const handleExportCSV = () => {
    // Define the headers
    const headers = ['Name', 'Email', 'Phone', 'Total Bookings', 'Last Visit'];
    
    // Map the data into CSV format
    const csvData = filteredGuests.map(
      (g) => `"${g.name}","${g.email}","${g.phone}",${g.totalBookings},"${g.lastVisit}"`
    );
    
    // Combine headers and data
    const csvContent = [headers.join(','), ...csvData].join('\n');
    
    // Create a Blob and trigger download
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

  // Helper to extract initials for the avatar (e.g., "Rajesh Kumar" -> "RK")
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0b6b3a] hover:bg-[#095930] text-white rounded-xl font-medium transition-colors shadow-sm w-fit"
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
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-[#0b6b3a] focus:ring-1 focus:ring-[#0b6b3a] focus:outline-none transition-all"
          />
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Showing {filteredGuests.length} of {initialGuests.length} guests
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
          <div className="w-12 h-12 bg-green-50 text-[#0b6b3a] rounded-xl flex items-center justify-center">
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
              <div className="w-12 h-12 bg-[#0b6b3a] text-white rounded-full flex items-center justify-center font-semibold text-lg tracking-wide">
                {getInitials(guest.name)}
              </div>
              <div className="px-3 py-1 bg-green-50 text-[#0b6b3a] text-xs font-medium rounded-full border border-green-100">
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
                <span>Last visit: {guest.lastVisit}</span>
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