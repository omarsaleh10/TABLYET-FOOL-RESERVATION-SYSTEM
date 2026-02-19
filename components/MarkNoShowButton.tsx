'use client';

import { markNoShow } from '@/app/reservation-actions';

export default function MarkNoShowButton({ reservationId, className, isMobile = false }: { reservationId: string, className?: string, isMobile?: boolean }) {
  
  const handleClick = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to mark this as No-Show?\n\nThis will REMOVE the reservation and FREE up the tables."
    );

    if (confirmed) {
      await markNoShow(reservationId);
    }
  };

  return (
    <button 
        onClick={handleClick}
        className={className || "text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg transition-colors font-bold text-xs uppercase tracking-wide"}
        title="Removes reservation and frees table capacity"
    >
        {isMobile ? 'Mark No-Show / Free' : 'Mark No-Show / Free'}
    </button>
  );
}
