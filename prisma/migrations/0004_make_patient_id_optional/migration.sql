-- AlterTable: Make patientId optional on Invoice
ALTER TABLE "Invoice" ALTER COLUMN "patientId" DROP NOT NULL;
