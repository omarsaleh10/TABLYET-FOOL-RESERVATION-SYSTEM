-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TIMESTAMP(3) NOT NULL,
    "slot" TEXT NOT NULL,
    "partySize" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotLock" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "slot" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SlotLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TableReservations" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SlotLock_date_slot_key" ON "SlotLock"("date", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "_TableReservations_AB_unique" ON "_TableReservations"("A", "B");

-- CreateIndex
CREATE INDEX "_TableReservations_B_index" ON "_TableReservations"("B");

-- AddForeignKey
ALTER TABLE "_TableReservations" ADD CONSTRAINT "_TableReservations_A_fkey" FOREIGN KEY ("A") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TableReservations" ADD CONSTRAINT "_TableReservations_B_fkey" FOREIGN KEY ("B") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;
