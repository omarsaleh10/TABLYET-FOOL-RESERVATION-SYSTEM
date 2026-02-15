import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // 1. Delete all existing tables
  await prisma.table.deleteMany({})
  console.log('Deleted all existing tables.')

  // 2. Create 34 tables (T1 -> T34)
  const tablesData = []
  for (let i = 1; i <= 34; i++) {
    tablesData.push({
      name: `T${i}`,
      capacity: 5,
    })
  }

  await prisma.table.createMany({
    data: tablesData,
  })

  console.log(`Created ${tablesData.length} tables (T1 - T34).`)
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
