-- AlterTable
ALTER TABLE "Location" ADD COLUMN "closeTime" TEXT;
ALTER TABLE "Location" ADD COLUMN "openTime" TEXT;
ALTER TABLE "Location" ADD COLUMN "visitType" TEXT;

-- CreateTable
CREATE TABLE "Transport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "basePrice" REAL NOT NULL,
    "pricePerKm" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
