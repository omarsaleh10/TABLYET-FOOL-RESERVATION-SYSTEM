import Link from 'next/link';
import Image from 'next/image';
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { tables: true },
  });

  if (!reservation) {
    notFound();
  }

  const dateStr = new Date(reservation.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Unique visual ref ID logic remains the same
  const refId = reservation.id.substring(0, 8).toUpperCase();

  // WhatsApp Message
  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE || ''; 
  
  const message = `Hello! I have a booking at Yala Ramadan by Tablyet Fool, for Night: ${dateStr}, Slot: ${reservation.slot}, Guests: ${reservation.partySize}, Ref: #${refId} Please confirm my table.`;
  
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen bg-brand-beige text-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-brand-text/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-light-beige border border-black/10 rounded-3xl shadow-xl overflow-hidden relative p-8 text-center space-y-6">
            
            {/* Header / Logos */}
             <div className="flex justify-center items-center gap-4 mb-4">
                <div className="relative w-16 h-16 drop-shadow-md">
                     <Image src="/yalla-ramadan-logo.png" alt="Yalla Ramadan" fill className="object-contain" />
                </div>
                <div className="h-8 w-[2px] bg-black/10" />
                <div className="relative w-16 h-16 rounded-full shadow-md bg-white">
                     <Image src="/logo-fool-no-bg.png" alt="Tablyet Fool" fill className="object-contain p-1 rounded-full" />
                </div>
            </div>

            <div className="space-y-2">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                    <span className="text-3xl">✅</span>
                </div>
                <h1 className="text-3xl font-bold text-black tracking-tight">Booking Pending!</h1>
                <p className="text-gray-800 font-medium text-base">
                    Your request has been received. Please confirm via WhatsApp to secure your table.
                </p>
            </div>

            {/* Ticket / Details Card */}
            <div className="bg-white rounded-xl p-6 border border-black/10 space-y-4 text-left shadow-sm">
                <div className="flex justify-between items-center border-b border-black/10 pb-4">
                    <span className="text-gray-600 text-xs uppercase tracking-wider font-bold">Reference</span>
                    <span className="text-brand-orange font-mono text-xl tracking-widest font-black">#{refId}</span>
                </div>
                 <div className="space-y-1">
                    <p className="text-xs text-gray-600 uppercase font-bold">Date & Time</p>
                    <p className="font-bold text-xl text-black">{dateStr}</p>
                    <p className="text-base text-gray-800 font-medium">{reservation.slot}</p>
                </div>
                <div className="flex justify-between pt-2">
                     <div>
                        <p className="text-xs text-gray-600 uppercase font-bold">Guests</p>
                        <p className="font-bold text-black">{reservation.partySize} People</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-gray-600 uppercase font-bold">Table(s)</p>
                        <p className="font-mono text-black font-bold">
                            {reservation.tables.map((t) => t.name).join(', ')}
                        </p>
                     </div>
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 pt-2">
                <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#20bd5a] transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    <span>Confirm via WhatsApp</span>
                    <span className="text-xl">💬</span>
                </a>
                
                <Link 
                    href="/"
                    className="block w-full py-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors border border-black/10"
                >
                    Back to Home
                </Link>
            </div>

        </div>
      </div>
    </div>
  );
}
