import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Debugging Database State ---')

  // 1. Count Tables
  const tableCount = await prisma.table.count()
  console.log(`Total Tables: ${tableCount}`)

  if (tableCount !== 34) {
      console.error('ERROR: Expected 34 tables!')
  } else {
      console.log('OK: Table count is correct.')
  }

  // 2. Check Reservations
  const reservationCount = await prisma.reservation.count()
  console.log(`Total Reservations: ${reservationCount}`)

  if (reservationCount > 0) {
      console.log('Listing current reservations:')
      const reservations = await prisma.reservation.findMany({
          include: { tables: true }
      })
      console.log(JSON.stringify(reservations, null, 2))
  } else {
      console.log('OK: No reservations found. System should be completely open.')
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
