import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { deleteReservation, markNoShow, toggleSlotLock } from '../../reservation-actions';

const prisma = new PrismaClient();

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; slot?: string; search?: string }>;
}) {
  const { date, slot, search } = await searchParams;

  const today = new Date().toISOString().split('T')[0];
  const selectedDateStr = date || today;

  // Parse Date for Query (UTC Midnight)
  const [year, month, day] = selectedDateStr.split('-').map(Number);
  const queryDate = new Date(Date.UTC(year, month - 1, day));

  // --- Fetch Data ---
  
  // 1. Reservations
  const whereClause: any = {
    date: queryDate,
  };
  if (slot && slot !== 'All') whereClause.slot = slot;
  if (search) {
     if (search.length > 2) {
         delete whereClause.date; 
         delete whereClause.slot; 
    }
    whereClause.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
    ];
  }

  const reservations = await prisma.reservation.findMany({
    where: whereClause,
    include: { tables: true },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Locks for this Date
  const locks = await prisma.slotLock.findMany({
      where: { date: queryDate }
  });
  const getLockStatus = (s: string) => locks.find(l => l.slot === s)?.isLocked || false;

  // 3. Stats
  const totalGuests = reservations.reduce((acc, curr) => acc + curr.partySize, 0);
  const totalReservations = reservations.length;
  const occupiedTableIds = new Set();
  reservations.forEach(r => r.tables.forEach(t => occupiedTableIds.add(t.id)));
  const occupiedCount = occupiedTableIds.size;

  const slotsList = ['10PM-12AM', '12AM-2AM', '2AM-4AM'];

  return (
    <div className="min-h-screen bg-brand-beige text-brand-text p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-brand-text">Admin Control</h1>
            <p className="text-brand-muted text-sm">Manage Capacity & Bookings</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="bg-light-beige p-4 rounded-xl border border-brand-text/5 shadow-sm">
                  <p className="text-xs uppercase text-brand-muted">Total Guests</p>
                  <p className="text-2xl font-bold text-brand-orange">{totalGuests}</p>
              </div>
              <div className="bg-light-beige p-4 rounded-xl border border-brand-text/5 shadow-sm">
                  <p className="text-xs uppercase text-brand-muted">Reservations</p>
                  <p className="text-2xl font-bold text-brand-text">{totalReservations}</p>
              </div>
               <div className="bg-light-beige p-4 rounded-xl border border-brand-text/5 shadow-sm">
                  <p className="text-xs uppercase text-brand-muted">Tables Occupied</p>
                  <p className="text-2xl font-bold text-brand-text">{occupiedCount} <span className="text-sm text-brand-muted font-normal">/ 34</span></p>
              </div>
          </div>
        </div>

        {/* --- CONTROL CENTER (Locks) --- */}
        <div className="bg-white p-6 rounded-2xl border border-brand-orange/20 shadow-md animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-brand-text mb-4 flex items-center gap-2">
                <span className="text-brand-orange">🔒</span> Slot Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Date Picker for Locking (Syncs with Filter) */}
                <form className="flex flex-col">
                     <label className="text-xs text-brand-muted mb-1">Manage Date</label>
                     <input 
                        type="date" 
                        name="date" 
                        defaultValue={selectedDateStr}
                        className="bg-brand-beige border border-brand-text/10 rounded-lg px-3 py-2 text-sm h-12 w-full font-bold text-brand-text focus:outline-none focus:border-brand-orange" 

                    />
                    <button type="submit" className="mt-2 text-xs text-brand-orange font-bold hover:underline">Go to Date</button>
                </form>

                {/* Slot Toggles */}
                {slotsList.map((s) => {
                    const isLocked = getLockStatus(s);
                    return (
                        <form key={s} action={async () => {
                            'use server'
                            await toggleSlotLock(selectedDateStr, s);
                        }} className="h-full">
                            <button 
                                type="submit"
                                className={`w-full h-full min-h-[50px] rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                                    isLocked 
                                    ? 'bg-red-50 border-red-500 text-red-600' 
                                    : 'bg-green-50/50 border-green-500/30 text-green-700 hover:bg-green-100'
                                }`}
                            >
                                <span className="font-bold text-sm">{s}</span>
                                <span className="text-xs uppercase tracking-wider font-bold">
                                    {isLocked ? 'LOCKED 🔒' : 'OPEN ✅'}
                                </span>
                            </button>
                        </form>
                    )
                })}
            </div>
        </div>

        {/* Filters */}
        <form className="bg-light-beige p-4 rounded-xl border border-brand-text/5 flex flex-col md:flex-row gap-4 items-end shadow-sm">
             {/* Re-using Date Input here for filtering the TABLE separate from the lock manager if needed, but keeping them synced is better UX. */}
             <div className="hidden">
                 <input type="date" name="date" defaultValue={selectedDateStr} />
             </div>
             
             <div className="flex-1 w-full">
                <label className="text-xs text-brand-muted mb-1">Search Reservations</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        name="search" 
                        placeholder="Name, Phone, or ID..."
                        defaultValue={search || ''}
                        className="bg-white border border-brand-text/10 rounded-lg px-3 py-2 text-sm h-10 w-full focus:outline-none focus:border-brand-orange"
                    />
                    <button type="submit" className="h-10 bg-brand-text text-white font-bold px-6 rounded-lg hover:bg-black transition-colors shadow-sm">
                        Search
                    </button>
                </div>
             </div>
             <a href="/admin/dashboard" className="h-10 flex items-center justify-center px-4 rounded-lg border border-brand-text/10 text-brand-muted text-sm hover:text-brand-text hover:bg-white transition-colors">
                Clear Filters
            </a>
        </form>

        {/* --- Table View --- */}
        <div className="hidden md:block overflow-x-auto bg-light-beige rounded-xl border border-brand-text/5 shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-white text-brand-muted uppercase tracking-wider border-b border-brand-text/5">
                    <tr>
                        <th className="p-4">Ref #</th>
                         <th className="p-4">Slot</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Guests</th>
                        <th className="p-4">Tables</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-brand-text/5">
                    {reservations.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-12 text-center text-brand-muted">
                                No reservations found.
                            </td>
                        </tr>
                    ) : (
                        reservations.map((res) => (
                            <tr key={res.id} className="hover:bg-white transition-colors">
                                <td className="p-4 font-mono text-brand-orange font-bold">#{res.id.substring(0, 8).toUpperCase()}</td>
                                <td className="p-4">
                                    <div className="font-bold text-brand-text">{res.slot}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-brand-text">{res.customerName}</div>
                                    <div className="text-brand-muted font-mono tracking-tight">{res.customerPhone}</div>
                                </td>
                                <td className="p-4 text-brand-text">{res.partySize}</td>
                                <td className="p-4 text-brand-text font-bold">
                                    {res.tables.map(t => t.name).join(', ')}
                                </td>
                                <td className="p-4 text-right">
                                    <form action={async () => {
                                        'use server'
                                        await markNoShow(res.id);
                                    }}>
                                        <button 
                                            type="submit"
                                            className="text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg transition-colors font-bold text-xs uppercase tracking-wide"
                                            title="Removes reservation and frees table capacity"
                                        >
                                            Mark No-Show / Free
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

           {/* --- Card View (Mobile) --- */}
        <div className="md:hidden space-y-4">
            {reservations.map((res) => (
                <div key={res.id} className="bg-light-beige p-4 rounded-xl border border-brand-text/5 space-y-3 shadow-md">
                    <div className="flex justify-between items-start">
                             <div>
                                <span className="text-brand-orange font-mono text-sm tracking-wider font-bold">#{res.id.substring(0, 8).toUpperCase()}</span>
                                <h3 className="font-bold text-lg text-brand-text">{res.customerName}</h3>
                             </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-white p-2 rounded border border-brand-text/5">
                            <p className="text-xs text-brand-muted uppercase">Slot</p>
                                <p className="text-brand-text">{res.slot}</p>
                        </div>
                        <div className="bg-white p-2 rounded border border-brand-text/5">
                                <p className="text-xs text-brand-muted uppercase">Tables</p>
                                <p className="text-brand-text font-bold">{res.tables.map(t => t.name).join(', ')}</p>
                        </div>
                    </div>
                     <form action={async () => {
                        'use server'
                        await markNoShow(res.id);
                    }}>
                        <button type="submit" className="w-full text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-3 rounded-lg transition-colors font-bold text-sm uppercase">
                            Mark No-Show / Free
                        </button>
                    </form>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}
