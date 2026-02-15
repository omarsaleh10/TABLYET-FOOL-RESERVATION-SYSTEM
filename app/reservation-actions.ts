'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// --- Reservation Actions ---

export async function createReservation(formData: {
  date: string;
  slot: string;
  partySize: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}) {
  try {
    const { date, slot, partySize, customerName, customerPhone, customerEmail } = formData;

    const bookingDate = new Date(date);

    // Get all tables
    const tables = await prisma.table.findMany();
    const totalCapacity = tables.reduce((acc, table) => acc + table.capacity, 0);

    // Date Range for the "Night" - Force UTC to match Admin Dashboard
    const [year, month, day] = date.split('-').map(Number);
    const timeStart = new Date(Date.UTC(year, month - 1, day));
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
        return { success: false, message: 'This slot is currently locked by admin.' };
    }

    // Check existing reservations
    const existingReservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: timeStart,
          lte: timeEnd,
        },
        slot: slot,
      },
      include: {
        tables: true 
      }
    });

    // --- NEW LOGIC: N-Tables Formula ---
    // 1 Table = 6
    // 2 Tables = 10 (6+6-2)
    // 3 Tables = 14 (6+6+6-4)
    // Formula: Capacity = 4N + 2
    // Inverse: N = Ceil((PartySize - 2) / 4)

    // Base case: Party of 1 or 2 fits in 1 table (actually formula gives 0, so min 1)
    let tablesNeeded = 1;
    if (partySize > 6) {
        tablesNeeded = Math.ceil((partySize - 2) / 4);
    }
    
    // Find free tables
    const bookedTableIds = new Set<number>();
    existingReservations.forEach(res => {
      res.tables.forEach(t => bookedTableIds.add(t.id));
    });

    const availableTables = tables.filter(t => !bookedTableIds.has(t.id));

    if (availableTables.length < tablesNeeded) {
        return { success: false, message: 'Not enough adjacent tables available for your party size.' };
    }

    // Allocate Tables (Just take the first N available)
    // Assumption: Any N available tables can be joined (as per user instruction)
    const allocatedTables = availableTables.slice(0, tablesNeeded).map(t => ({ id: t.id }));

    const reservation = await prisma.reservation.create({
      data: {
        date: bookingDate,
        slot,
        partySize,
        customerName,
        customerPhone,
        customerEmail,
        tables: {
          connect: allocatedTables
        }
      },
    });

    revalidatePath('/');
    return { success: true, id: reservation.id };
  } catch (error) {
    console.error('Reservation Error:', error);
    return { success: false, message: 'Failed to create reservation.' };
  }
}

// --- Admin Actions ---

export async function adminLogin(password: string) {
    // For simplicity, hardcoded or env var.
    // In a real app, use hashed passwords and secure sessions.
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (password === ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'true', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        return { success: true };
    } else {
        return { success: false, message: 'Invalid Password' };
    }
}

export async function softDeleteReservation(id: string) {
    try {
        await prisma.reservation.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Soft Delete Error:', error);
        return { success: false, message: 'Failed to cancel reservation' };
    }
}

export async function markNoShow(id: string) {
    try {
        await prisma.reservation.update({
            where: { id },
            data: { status: 'NO_SHOW' }
        });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('No Show Error:', error);
        return { success: false, message: 'Failed to mark No-Show' };
    }
}

export async function toggleSlotLock(dateStr: string, slot: string) {
    try {
        const date = new Date(dateStr);
        // Normalize to midnight UTC for consistency if needed, but local midnight is fine for this logic
        // The dashboard sends YYYY-MM-DD string, so new Date(dateStr) is UTC midnight if ISO string
        // Actually new Date('2024-03-01') is UTC midnight.
        
        // Let's ensure we match how we query/store.
        const [year, month, day] = dateStr.split('-').map(Number);
        const queryDate = new Date(Date.UTC(year, month - 1, day));

        const existingLock = await prisma.slotLock.findUnique({
             where: {
                date_slot: {
                    date: queryDate,
                    slot: slot
                }
            }
        });

        if (existingLock) {
            await prisma.slotLock.update({
                where: { id: existingLock.id },
                data: { isLocked: !existingLock.isLocked }
            });
        } else {
            await prisma.slotLock.create({
                data: {
                    date: queryDate,
                    slot,
                    isLocked: true
                }
            });
        }
        
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Lock Error:', error);
        return { success: false, message: 'Failed to toggle lock' };
    }
}
