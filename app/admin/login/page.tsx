'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../../reservation-actions';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await adminLogin(password);
    if (res.success) {
      router.push('/admin/dashboard');
    } else {
      setError(res.message || 'Invalid Password');
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-light-beige border border-brand-text/10 p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-brand-text mb-6">Admin Access</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="password"
              placeholder="Enter Password"
              className="w-full h-12 px-4 bg-white border border-brand-text/10 rounded-lg text-brand-text placeholder:text-brand-muted/40 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded border border-red-200">{error}</p>}

          <button 
            type="submit"
            className="w-full h-12 bg-brand-orange text-white font-bold rounded-lg hover:bg-[#d66a1e] transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
