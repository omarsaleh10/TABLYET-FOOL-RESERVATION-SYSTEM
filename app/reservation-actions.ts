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

    const reservedSeats = existingReservations.reduce((acc, res) => acc + res.partySize, 0);

    if (reservedSeats + partySize > totalCapacity) {
      return { success: false, message: 'Not enough overall capacity for this slot.' };
    }

    // Find which tables are already booked
    const bookedTableIds = new Set<number>();
    existingReservations.forEach(res => {
      res.tables.forEach(t => bookedTableIds.add(t.id));
    });

    const availableTables = tables.filter(t => !bookedTableIds.has(t.id));

    // Simple allocation: First Fit
    availableTables.sort((a, b) => a.capacity - b.capacity);

    let allocatedTables: { id: number }[] = [];
    let allocatedCapacity = 0;

    for (const table of availableTables) {
      if (allocatedCapacity < partySize) {
        allocatedTables.push({ id: table.id });
        allocatedCapacity += table.capacity;
      } else {
        break;
      }
    }

    if (allocatedCapacity < partySize) {
       return { success: false, message: 'Not enough available tables to fit your party.' };
    }

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

export async function deleteReservation(id: string) {
    try {
        await prisma.reservation.delete({
            where: { id }
        });
        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Delete Error:', error);
        return { success: false, message: 'Failed to delete' };
    }
}

export async function markNoShow(id: string) {
    // For now, "No Show" effectively frees up the table, so we can delete it 
    // or we could add a status field to the Reservation model later.
    // Let's just delete it for now to free capacity.
    return deleteReservation(id);
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
