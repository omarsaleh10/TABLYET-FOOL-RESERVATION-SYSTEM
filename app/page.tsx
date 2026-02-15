'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createReservation } from './reservation-actions';
import { Calendar, Clock, Users, User, Phone, Mail, Moon, Tent } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  
  // Form Data
  const [formData, setFormData] = useState({
    date: '',
    slot: '', // '10PM-12AM', '12AM-2AM', '2AM-4AM'
    partySize: 2,
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  });

  const slots = ['10PM-12AM', '12AM-2AM', '2AM-4AM'];

  // Handlers
  const handleAvailabilityCheck = async () => {
    setLoading(true);
    setAvailabilityError('');

    try {
      const response = await fetch('/api/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          slot: formData.slot,
          partySize: Number(formData.partySize)
        })
      });

      const result = await response.json();

      if (result.available) {
        setStep(4); // Move to Contact Form
      } else {
        setAvailabilityError('Fully booked for this slot! Please try another time.');
      }
    } catch (error) {
      console.error(error);
      setAvailabilityError('Failed to check availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await createReservation({
      ...formData,
      partySize: Number(formData.partySize)
    });

    if (response.success && response.id) {
      router.push(`/success?id=${response.id}`);
    } else {
      setAvailabilityError(response.message || 'Booking failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-body text-brand-charcoal">
      
      {/* Background Decor: Hanging Lantern (Absolute Position) */}
      <div className="absolute top-0 right-0 w-20 md:w-28 opacity-80 pointer-events-none drop-shadow-xl z-0 animate-pulse">
        <svg viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="50" y1="0" x2="50" y2="40" stroke="#2D3436" strokeWidth="2"/>
            <path d="M50 40 L70 60 L80 100 L50 130 L20 100 L30 60 Z" fill="#F07C28" stroke="#2D3436" strokeWidth="2"/>
            <circle cx="50" cy="90" r="10" fill="#E6B34D" className="animate-pulse"/>
            <path d="M50 130 L50 160" stroke="#2D3436" strokeWidth="2"/>
            <circle cx="50" cy="165" r="5" fill="#006266"/>
        </svg>
      </div>

      {/* Decorative Top Pattern (Khayamiya Vibe) */}
      <div className="absolute top-0 left-0 w-full h-4 bg-repeat-x opacity-30" 
           style={{ backgroundImage: 'linear-gradient(45deg, #006266 25%, transparent 25%), linear-gradient(-45deg, #006266 25%, transparent 25%)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center gap-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
             {/* Logos Side-by-Side */}
             <div className="flex justify-center items-center gap-6 mb-2">
                 <div className="relative w-24 h-24 md:w-32 md:h-32 drop-shadow-xl hover:scale-105 transition-transform duration-500">
                     <Image 
                        src="/yalla-ramadan-logo.png" 
                        alt="Yalla Ramadan" 
                        fill 
                        className="object-contain"
                        priority
                     />
                </div>
                {/* Vertical Divider */}
                <div className="h-16 w-[2px] bg-black rounded-full" />
                
                <div className="relative w-24 h-24 md:w-32 md:h-32 drop-shadow-xl hover:scale-105 transition-transform duration-500">
                     <Image 
                        src="/logo-fool-no-bg.png" 
                        alt="Tablyet Fool" 
                        fill 
                        className="object-contain"
                        priority
                     />
                </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-charcoal tracking-tight">
              Ramadan Nights <span className="text-brand-orange">.</span>
            </h1>
            <p className="text-brand-muted font-display italic text-lg">
              suhoor bookings, reimagined.
            </p>
        </div>

        {/* Reservation Card */}
        <div className="w-full bg-brand-cream rounded-3xl shadow-2xl shadow-brand-orange/10 overflow-hidden relative border-2 border-brand-orange/40 shadow-[0_0_30px_rgba(240,124,40,0.15)]">
            
            {/* Progress Bar (Hue Orange) */}
            <div className="h-2 bg-brand-charcoal/5 w-full">
                <div 
                    className="h-full bg-gradient-to-r from-brand-orange to-[#E15F22] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(240,124,40,0.5)]" 
                    style={{ width: `${(step / 4) * 100}%` }} 
                />
            </div>

            <div className="p-8 md:p-10 min-h-[400px] flex flex-col justify-center">

                {/* Step 1: Date Selection */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2">
                             <div className="mx-auto w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange mb-4">
                                <Moon size={24} />
                             </div>
                            <h2 className="text-3xl font-display font-bold text-brand-charcoal">Choose Your Night</h2>
                            <div className="flex items-center justify-center gap-4 py-2">
                                <span className="h-[1px] w-12 bg-brand-charcoal/10" />
                                <span className="h-[1px] w-12 bg-brand-charcoal/10" />
                            </div>
                        </div>

                        {/* Horizontal Date Picker */}
                        <div className="relative -mx-8 px-8">
                            <div className="flex overflow-x-auto gap-3 pb-6 px-1 snap-x scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {Array.from({ length: 30 }).map((_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + i);
                                    const dateStr = d.toISOString().split('T')[0];
                                    const isSelected = formData.date === dateStr;
                                    
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setFormData({...formData, date: dateStr})}
                                            className={`flex-shrink-0 w-20 h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all snap-center relative overflow-hidden group
                                                ${isSelected 
                                                ? 'border-brand-orange bg-brand-orange/10 shadow-[0_0_15px_rgba(240,124,40,0.3)] scale-105 z-10' 
                                                : 'border-brand-charcoal/10 bg-white hover:border-brand-orange/50 hover:bg-brand-orange/5'
                                                }`}
                                        >
                                            <span className={`text-xs uppercase font-bold tracking-wider ${isSelected ? 'text-brand-orange' : 'text-brand-muted'}`}>
                                                {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </span>
                                            <span className={`text-2xl font-display font-bold ${isSelected ? 'text-brand-charcoal' : 'text-brand-charcoal/80'}`}>
                                                {d.getDate()}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute top-0 right-0 w-3 h-3 bg-brand-orange rounded-bl-lg" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Fade Gradients for visual cue */}
                            <div className="absolute left-0 top-0 bottom-6 w-8 bg-gradient-to-r from-brand-cream to-transparent pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-6 w-8 bg-gradient-to-l from-brand-cream to-transparent pointer-events-none" />
                        </div>

                        {/* Selected Date Display */}
                        {formData.date && (
                            <div className="text-center animate-in fade-in zoom-in duration-300">
                                <p className="text-brand-muted text-sm uppercase tracking-widest font-bold">Selected Night</p>
                                <p className="text-brand-charcoal font-display text-lg">
                                    {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={() => formData.date && setStep(2)}
                            disabled={!formData.date}
                            className="w-full py-4 bg-gradient-to-r from-brand-orange to-[#E15F22] text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            <span>Find a Table</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                )}

                {/* Step 2: Time Slot */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                            <h2 className="text-2xl font-display font-bold text-brand-charcoal">Select Time</h2>
                            <p className="text-brand-muted text-sm mt-1">For the night of {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>

                        <div className="grid gap-3">
                            {slots.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFormData({...formData, slot: s})}
                                    className={`relative w-full h-16 rounded-xl font-bold font-display text-lg border-2 transition-all flex items-center justify-center gap-3 overflow-hidden group
                                        ${formData.slot === s 
                                        ? 'border-brand-orange bg-brand-orange/5 text-brand-orange shadow-md' 
                                        : 'border-brand-charcoal/5 bg-white text-brand-muted hover:border-brand-orange/30'
                                        }`}
                                >
                                    <Clock size={18} className={formData.slot === s ? "text-brand-orange" : "text-brand-muted/40"} />
                                    <span>{s}</span>
                                    {formData.slot === s && (
                                        <div className="absolute right-4 w-2 h-2 rounded-full bg-brand-orange shadow-[0_0_10px_rgba(240,124,40,0.8)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="p-4 rounded-xl border border-brand-charcoal/10 hover:bg-black/5 transition-colors">
                                <span className="transform rotate-180 inline-block">→</span>
                            </button>
                            <button 
                                onClick={() => setStep(3)}
                                disabled={!formData.slot}
                                className="flex-1 py-4 bg-gradient-to-r from-brand-orange to-[#E15F22] text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Guests */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 text-center">
                        <div>
                             <h2 className="text-2xl font-display font-bold text-brand-charcoal">Party Size</h2>
                             <p className="text-brand-muted text-sm mt-1">How many people are joining?</p>
                        </div>

                        <div className="relative py-8">
                             <div className="flex items-center justify-center gap-8">
                                <button 
                                    onClick={() => setFormData({...formData, partySize: Math.max(1, formData.partySize - 1)})}
                                    className="w-14 h-14 rounded-full border-2 border-brand-charcoal/10 flex items-center justify-center text-2xl hover:border-brand-orange hover:text-brand-orange transition-all bg-white"
                                >-</button>
                                
                                <div className="text-center min-w-[80px]">
                                    <span className="text-5xl font-display font-bold text-brand-orange block">{formData.partySize}</span>
                                    <span className="text-xs uppercase tracking-widest text-brand-muted block mt-1">Guests</span>
                                </div>

                                <button 
                                    onClick={() => setFormData({...formData, partySize: Math.min(50, formData.partySize + 1)})}
                                    className="w-14 h-14 rounded-full border-2 border-brand-charcoal/10 flex items-center justify-center text-2xl hover:border-brand-orange hover:text-brand-orange transition-all bg-white"
                                >+</button>
                            </div>
                        </div>

                        {availabilityError && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {availabilityError}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="p-4 rounded-xl border border-brand-charcoal/10 hover:bg-black/5 transition-colors">
                                <span className="transform rotate-180 inline-block">→</span>
                            </button>
                            <button 
                                onClick={handleAvailabilityCheck}
                                disabled={loading || formData.partySize < 1}
                                className="flex-1 py-4 bg-gradient-to-r from-brand-orange to-[#E15F22] text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <span className="animate-spin">⌛</span> : 'Check Availability'}
                            </button>
                        </div>
                    </div>
                )}

                 {/* Step 4: Contact */}
                 {step === 4 && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="text-center">
                             <h2 className="text-2xl font-display font-bold text-brand-charcoal">Final Booking Details</h2>
                             <p className="text-brand-muted text-sm mt-1">We'll send confirmation via WhatsApp.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted/50" size={20} />
                                <input 
                                    type="text" required placeholder="Full Name"
                                    className="w-full h-14 pl-12 pr-4 bg-white border border-brand-charcoal/10 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 outline-none transition-all"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                />
                            </div>
                             <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted/50" size={20} />
                                <input 
                                    type="tel" required placeholder="Phone Number"
                                    className="w-full h-14 pl-12 pr-4 bg-white border border-brand-charcoal/10 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 outline-none transition-all"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                                />
                            </div>
                             <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted/50" size={20} />
                                <input 
                                    type="email" required placeholder="Email Address"
                                    className="w-full h-14 pl-12 pr-4 bg-white border border-brand-charcoal/10 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 outline-none transition-all"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                                />
                            </div>
                        </div>

                        {availabilityError && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                                {availabilityError}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-brand-orange to-[#E15F22] text-white font-bold text-lg rounded-xl shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? 'Confirming...' : 'Complete Reservation'}
                        </button>

                         <button 
                            type="button" 
                            onClick={() => setStep(3)}
                            className="w-full text-brand-muted text-sm hover:text-brand-charcoal hover:underline"
                        >
                            Back to Guests
                        </button>
                    </form>
                 )}

            </div>
        </div>
        
        {/* Footer Stats - Circular Badges */}
        <div className="flex gap-6 md:gap-12 mt-4 opacity-80">
            {[
                { label: 'Nights', val: '30' },
                { label: 'PM-AM', val: '10-4' },
                { label: 'Seats', val: '200' },
            ].map((stat, i) => (
                <div key={i} className="w-16 h-16 rounded-full border-2 border-dashed border-brand-charcoal/20 flex flex-col items-center justify-center bg-brand-beige shadow-sm rotate-[-5deg] hover:rotate-0 transition-transform cursor-default">
                    <span className="text-lg font-bold font-display text-brand-charcoal">{stat.val}</span>
                    <span className="text-[9px] uppercase tracking-wide text-brand-muted">{stat.label}</span>
                </div>
            ))}
        </div>
        
      </div>
    </div>
  );
}
