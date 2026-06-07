"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, Sun, Moon, Plus, CalendarOff, Download, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

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
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal States
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Form States
  const [walkInForm, setWalkInForm] = useState({
    targetDay: 'today', // 'today' or 'tomorrow'
    guestName: '',
    guestPhone: '',
    slotType: 'Day Out' as 'Day Out' | 'Night Stay',
    guestCount: 2,
    totalAmount: '',
    paidAmount: ''
  });

  const [blockForm, setBlockForm] = useState({
    date: '',
    slotType: 'both' as 'day' | 'night' | 'both',
    reason: ''
  });

  useEffect(() => {
    const todayDate = new Date();
    const tomorrowDate = new Date(todayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    setDates({
      today: todayDate.toISOString().split('T')[0],
      tomorrow: tomorrowDate.toISOString().split('T')[0]
    });
    
    setIsMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
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

  // --- QUICK ACTION HANDLERS ---

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const bookingDate = walkInForm.targetDay === 'today' ? dates.today : dates.tomorrow;
    const total = Number(walkInForm.totalAmount);
    const paid = Number(walkInForm.paidAmount);
    
    // Auto-calculate status: If they paid in full at the desk, it is COMPLETED
    const status: BookingStatus = paid >= total ? 'COMPLETED' : 'CONFIRMED';

    const { error } = await supabase.from('bookings').insert({
      guest_name: walkInForm.guestName,
      guest_email: null, // Walk-ins usually skip email
      guest_phone: walkInForm.guestPhone,
      booking_date: bookingDate,
      slot_type: walkInForm.slotType,
      guest_count: walkInForm.guestCount,
      total_amount: total,
      paid_amount: paid,
      status: status
    });

    if (!error) {
      // Reset form and refresh dashboard
      setWalkInForm({ targetDay: 'today', guestName: '', guestPhone: '', slotType: 'Day Out', guestCount: 2, totalAmount: '', paidAmount: '' });
      setIsWalkInModalOpen(false);
      await fetchDashboardData();
    } else {
      console.error("Walk-in error:", error);
    }
    setIsProcessing(false);
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const dayBlocked = blockForm.slotType === 'both' || blockForm.slotType === 'day';
    const nightBlocked = blockForm.slotType === 'both' || blockForm.slotType === 'night';

    const { error } = await supabase.from('blocked_dates').insert({
      blocked_date: blockForm.date,
      day_blocked: dayBlocked,
      night_blocked: nightBlocked,
      reason: blockForm.reason
    });

    if (!error) {
      setBlockForm({ date: '', slotType: 'both', reason: '' });
      setIsBlockModalOpen(false);
      // No need to fetch dashboard data here since blocks don't show on the main feed
    } else {
      console.error("Block error:", error);
    }
    setIsProcessing(false);
  };

  const handleDownloadManifest = () => {
    const todayBookings = bookings.filter(b => b.booking_date === dates.today && b.status !== 'CANCELLED');
    
    if (todayBookings.length === 0) {
      alert("No arrivals scheduled for today to export.");
      return;
    }

    const headers = ['Guest Name', 'Phone', 'Slot', 'Guest Count', 'Payment Status'];
    const csvData = todayBookings.map(b => 
      `"${b.guest_name}","${b.guest_phone}","${b.slot_type}",${b.guest_count},"${b.status}"`
    );
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Daily_Manifest_${dates.today}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- DATA FILTERING ENGINE ---
  const todayBookings = bookings.filter(b => b.booking_date === dates.today && b.status !== 'CANCELLED');
  const tomorrowBookings = bookings.filter(b => b.booking_date === dates.tomorrow && b.status !== 'CANCELLED');
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* --- WALK-IN MODAL --- */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-gray-900">Add Walk-in Booking</h3>
              <button onClick={() => setIsWalkInModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              {/* Fast Date Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button type="button" onClick={() => setWalkInForm({...walkInForm, targetDay: 'today'})} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${walkInForm.targetDay === 'today' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  Today ({new Date(dates.today).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})})
                </button>
                <button type="button" onClick={() => setWalkInForm({...walkInForm, targetDay: 'tomorrow'})} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${walkInForm.targetDay === 'tomorrow' ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                  Tomorrow ({new Date(dates.tomorrow).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})})
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Guest Name</label>
                  <input required type="text" value={walkInForm.guestName} onChange={e => setWalkInForm({...walkInForm, guestName: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-800" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                  <input required type="text" value={walkInForm.guestPhone} onChange={e => setWalkInForm({...walkInForm, guestPhone: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-800" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slot</label>
                  <select value={walkInForm.slotType} onChange={e => setWalkInForm({...walkInForm, slotType: e.target.value as any})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-800">
                    <option value="Day Out">Day Out</option>
                    <option value="Night Stay">Night Stay</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Guests</label>
                  <input required type="number" min="1" value={walkInForm.guestCount} onChange={e => setWalkInForm({...walkInForm, guestCount: Number(e.target.value)})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-800" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Bill (₹)</label>
                  <input required type="number" min="0" value={walkInForm.totalAmount} onChange={e => setWalkInForm({...walkInForm, totalAmount: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-800" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                  <input required type="number" min="0" value={walkInForm.paidAmount} onChange={e => setWalkInForm({...walkInForm, paidAmount: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-800" />
                </div>
              </div>

              <button disabled={isProcessing} type="submit" className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 mt-4 transition-colors disabled:opacity-50">
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Walk-in
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- BLOCK DATES MODAL --- */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-gray-900">Block Date</h3>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleBlockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Date</label>
                <input required type="date" min={dates.today} value={blockForm.date} onChange={e => setBlockForm({...blockForm, date: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Slot to Block</label>
                <select value={blockForm.slotType} onChange={e => setBlockForm({...blockForm, slotType: e.target.value as any})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500">
                  <option value="both">Entire Day</option>
                  <option value="day">Day Out Only</option>
                  <option value="night">Night Stay Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
                <input required type="text" placeholder="e.g. Maintenance" value={blockForm.reason} onChange={e => setBlockForm({...blockForm, reason: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500" />
              </div>

              <button disabled={isProcessing} type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 mt-4 transition-colors disabled:opacity-50">
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Block
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here are your operational tasks.</p>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button onClick={() => setIsWalkInModalOpen(true)} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-800 transition-all text-left group">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-800 transition-colors">
            <Plus className="w-5 h-5 text-green-700 group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Add Walk-in</p>
            <p className="text-xs text-gray-500">Log a new booking</p>
          </div>
        </button>

        <button onClick={() => setIsBlockModalOpen(true)} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-500 transition-all text-left group">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
            <CalendarOff className="w-5 h-5 text-orange-700 group-hover:text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Block Dates</p>
            <p className="text-xs text-gray-500">Manage availability</p>
          </div>
        </button>

        <button onClick={handleDownloadManifest} className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-600 transition-all text-left group">
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