import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id: string }>;
}) {
  const { id } = await searchParams;

  if (!id) {
    redirect('/');
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { tables: true },
  });

  if (!reservation) {
    redirect('/');
  }

  // Format Date: "Friday, March 14"
  const dateObj = new Date(reservation.date);
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Table Names: "T1, T2"
  const tableNames = reservation.tables.map((t) => t.name).join(', ');

  // Reference: First 8 chars
  const refId = reservation.id.substring(0, 8).toUpperCase();

  // WhatsApp Message
  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE || ''; 
  // Ensure formatted phone number (remove + or spaces if needed, but usually raw input is safer to handle if env variable is clean)
  
  const message = `Hello! I have a booking at Yala Ramadan by Tablyet Fool, for Night: ${dateStr}, Slot: ${reservation.slot}, Guests: ${reservation.partySize}, Ref: #${refId} Please confirm my table.`;
  
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      {/* Golden Ticket Container */}
      <div className="max-w-md w-full bg-neutral-900 border-2 border-brand-gold/30 rounded-3xl relative overflow-hidden shadow-2xl shadow-brand-gold/10">
        
        {/* Top Section: Header */}
        <div className="bg-white/5 p-8 text-center border-b border-dashed border-white/20 relative">
          {/* Decorative Circles for Ticket Look */}
          <div className="absolute -left-4 bottom-[-16px] w-8 h-8 bg-neutral-900 rounded-full" />
          <div className="absolute -right-4 bottom-[-16px] w-8 h-8 bg-neutral-900 rounded-full" />

          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-beige">Booking Confirmed!</h1>
          <p className="text-white/60 text-sm mt-1">Your spot is secured.</p>
        </div>

        {/* Middle Section: Details */}
        <div className="p-8 space-y-6 bg-white/5">
          
          <div className="grid grid-cols-2 gap-y-6 text-left">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Night</p>
              <p className="text-brand-beige font-semibold">{dateStr}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Time Slot</p>
              <p className="text-brand-beige font-semibold">{reservation.slot}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Guests</p>
              <p className="text-brand-beige font-semibold">{reservation.partySize} Guests</p>
            </div>
             <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Table(s)</p>
              <p className="text-brand-gold font-bold">{tableNames}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
             <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Reference ID</p>
             <code className="text-xl font-mono text-brand-beige tracking-widest">#{refId}</code>
          </div>

        </div>

        {/* Bottom Section: Actions */}
        <div className="p-4 bg-black/20 text-center">
            {phone && (
                <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl transition-all mb-3 flex items-center justify-center gap-2 shadow-lg"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    Confirm via WhatsApp
                </a>
            )}
            
            <Link 
                href="/"
                className="text-white/40 text-sm hover:text-white transition-colors"
            >
                Book Another Table
            </Link>
        </div>
      </div>
    </div>
  );
}
