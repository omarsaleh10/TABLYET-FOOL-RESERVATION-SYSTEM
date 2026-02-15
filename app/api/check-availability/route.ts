import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { date, slot, partySize } = await request.json();

    if (!date || !slot || !partySize) {
      return NextResponse.json({ available: false, error: 'Missing fields' }, { status: 400 });
    }
    
    const tables = await prisma.table.findMany();
    const totalCapacity = tables.reduce((acc, table) => acc + table.capacity, 0);

    // Parse Date strictly from YYYY-MM-DD string to UTC Midnight
    const [year, month, day] = date.split('-').map(Number);
    const timeStart = new Date(Date.UTC(year, month - 1, day));
    
    // End of that day in UTC
    const timeEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    // Check if slot is locked
    const lock = await prisma.slotLock.findUnique({
      where: {
        date_slot: {
          date: timeStart,
          slot: slot
        }
      }
    });

    if (lock && lock.isLocked) {
        return NextResponse.json({ available: false, message: 'Slot Locked' });
    }

    const existingReservations = await prisma.reservation.findMany({
       where: {
         date: { gte: timeStart, lte: timeEnd },
         slot: slot
       },
       include: { tables: true }
    });

    const reservedSeats = existingReservations.reduce((acc, res) => acc + res.partySize, 0);

    // --- NEW LOGIC: N-Tables Formula ---
    // Capacity = 4N + 2
    // N = Ceil((PartySize - 2) / 4)

    let tablesNeeded = 1;
    if (partySize > 6) {
        tablesNeeded = Math.ceil((partySize - 2) / 4);
    }

    // Exact table availability check
    const bookedTableIds = new Set<number>();
    existingReservations.forEach(res => {
      res.tables.forEach(t => bookedTableIds.add(t.id));
    });

    const availableTables = tables.filter(t => !bookedTableIds.has(t.id));

    if (availableTables.length < tablesNeeded) {
        return NextResponse.json({ available: false });
    }

    return NextResponse.json({ available: true });

  } catch (error) {
    console.error('Check Availability Error:', error);
    return NextResponse.json({ available: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
