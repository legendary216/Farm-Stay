"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Menu, X, LayoutDashboard, BookOpen, Calendar as CalendarIcon, Users, LogOut, Leaf, Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Bookings', href: '/admin/bookings', icon: BookOpen },
    { name: 'Calendar', href: '/admin/calendar', icon: CalendarIcon },
    { name: 'Guests', href: '/admin/guests', icon: Users },
  ];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    
    // 1. Destroy the secure session in Supabase
    await supabase.auth.signOut();
    
    // 2. Force Next.js to re-evaluate the middleware state
    router.refresh();
    
    // 3. Teleport the user back to the login screen
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Hamburger Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-400" />
          <span className="text-white font-medium">Kulaghar Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white p-2">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-gray-900 text-gray-300 flex flex-col transition-transform duration-300 z-50 pt-16 md:pt-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h2 className="text-white font-medium leading-tight">Kulaghar Stay</h2>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-green-600 text-white' : 'hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Secure Sign Out Section */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            <span className="font-medium">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pt-16 md:pt-0 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}