import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tables: true }
    });

    const csvHeader = 'ID,Date,Slot,Status,Customer Name,Phone,Email,Party Size,Tables,Created At\n';
    const csvRows = reservations.map(res => {
      const dateStr = res.date.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const tablesStr = res.tables.map(t => t.name).join(';');
      const status = (res as any).status || 'CONFIRMED'; // Fallback for old records
      
      return `"${res.id}","${dateStr}","${res.slot}","${status}","${res.customerName}","${res.customerPhone}","${res.customerEmail}",${res.partySize},"${tablesStr}","${res.createdAt.toISOString()}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reservations-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
