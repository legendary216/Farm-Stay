"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, Sun, Moon, Plus, CalendarOff, Download, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client'; // Adjust this import to match your actual Supabase client location

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
  created_at: string;
}

export default function AdminDashboard() {
  const supabase = createClient();
  const [isMounted, setIsMounted] = useState(false);
  const [dates, setDates] = useState({ today: '', tomorrow: '' });
  
  // Database State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Compute local dates safely on the client
    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    setDates({
      today: todayDate.toISOString().split('T')[0],
      tomorrow: tomorrowDate.toISOString().split('T')[0]
    });
    
    setIsMounted(true);
    
    // 2. Fetch Live Dashboard Data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    // Fetch all bookings, ordered strictly by newest first for the activity feed
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching dashboard data:", error);
    } else if (data) {
      setBookings(data as Booking[]);
    }
    setIsLoading(false);
  };

  // --- DATA FILTERING ENGINE ---
  // Ensure we only show active arrivals (ignore cancelled guests)
  const todayBookings = bookings.filter(b => 
    b.booking_date === dates.today && b.status !== 'CANCELLED'
  );
  
  const tomorrowBookings = bookings.filter(b => 
    b.booking_date === dates.tomorrow && b.status !== 'CANCELLED'
  );

  // The main array is already sorted by created_at descending, so just take the top 7
  const recentBookings = bookings.slice(0, 7);

  if (!isMounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-8 h-8 text-green-800 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading live operations...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here are your operational tasks.</p>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-800 transition-all text-left group">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-800 transition-colors">
            <Plus className="w-5 h-5 text-green-700 group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Add Walk-in</p>
            <p className="text-xs text-gray-500">Log a new booking</p>
          </div>
        </button>

        <button className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-500 transition-all text-left group">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
            <CalendarOff className="w-5 h-5 text-orange-700 group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Block Dates</p>
            <p className="text-xs text-gray-500">Manage availability</p>
          </div>
        </button>

        <button className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-600 transition-all text-left group">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <Download className="w-5 h-5 text-blue-700 group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Daily Manifest</p>
            <p className="text-xs text-gray-500">Download guest list</p>
          </div>
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Left Column: Today & Tomorrow */}
        <div className="space-y-6">
          
          {/* Today's Activity */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-green-800" />
              <h2 className="text-lg md:text-xl font-medium text-gray-900">Today's Activity</h2>
            </div>

            {todayBookings.length > 0 ? (
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      {booking.slot_type === 'Day Out' ? (
                        <Sun className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Moon className="w-5 h-5 text-indigo-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{booking.guest_name}</p>
                        <p className="text-sm text-gray-600">
                          {booking.slot_type} • {booking.guest_count} guests
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No arrivals scheduled for today.</p>
              </div>
            )}
          </div>

          {/* Tomorrow's Activity */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg md:text-xl font-medium text-gray-900">Tomorrow's Activity</h2>
            </div>

            {tomorrowBookings.length > 0 ? (
              <div className="space-y-3">
                {tomorrowBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      {booking.slot_type === 'Day Out' ? (
                        <Sun className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Moon className="w-5 h-5 text-indigo-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{booking.guest_name}</p>
                        <p className="text-sm text-gray-600">
                          {booking.slot_type} • {booking.guest_count} guests
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 text-sm">No arrivals scheduled for tomorrow.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 h-fit">
          <h2 className="text-lg md:text-xl font-medium text-gray-900 mb-6">Recent Bookings</h2>

          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{booking.guest_name}</p>
                    <p className="text-sm text-gray-600 mb-0.5">
                      {new Date(booking.booking_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      • {booking.slot_type}
                    </p>
                    <p className="text-xs text-gray-400">
                      Booked {new Date(booking.created_at).toLocaleTimeString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No recent activity found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}