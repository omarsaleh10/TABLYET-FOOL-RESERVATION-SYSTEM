import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 1. Delete all existing tables
  await prisma.table.deleteMany({})
  console.log('Deleted all existing tables.')

  // 2. Create 38 tables (T1 -> T38) with capacity 6
  const tablesData = []
  for (let i = 1; i <= 38; i++) {
    tablesData.push({
      name: `T${i}`,
      capacity: 6,
    })
  }

  await prisma.table.createMany({
    data: tablesData,
  })

  console.log(`Created ${tablesData.length} tables (T1 - T38) with capacity 6.`)
  console.log('Seeding finished.')
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
