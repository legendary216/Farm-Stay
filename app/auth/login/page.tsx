"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Leaf, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      // Success! The middleware will now see the secure cookie.
      // Refresh the router to trigger the middleware, then push to admin.
      router.refresh();
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Kulaghar Stay</h1>
          <p className="text-gray-500 mt-2">Secure Admin Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-gray-200 rounded-xl focus:border-green-800 focus:ring-1 focus:ring-green-800 focus:outline-none transition-all text-gray-900"
                  placeholder="admin@kulaghar.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-gray-200 rounded-xl focus:border-green-800 focus:ring-1 focus:ring-green-800 focus:outline-none transition-all text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-green-800 hover:bg-green-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold text-lg transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Authorized personnel only. All access is logged.
        </p>

      </div>
    </div>
  );
}