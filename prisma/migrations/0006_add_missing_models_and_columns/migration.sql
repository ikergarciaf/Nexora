-- CreateTable: Campaign
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "segment" TEXT NOT NULL DEFAULT 'ALL',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable: InventoryItem
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'General',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 5,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supplier" TEXT,
    "batch" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PatientDocument
CREATE TABLE "PatientDocument" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PushSubscription
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to Tenant
ALTER TABLE "Tenant" ADD COLUMN "appointmentInterval" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "Tenant" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'es';
ALTER TABLE "Tenant" ADD COLUMN "publicBookingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Tenant" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "Tenant" ADD COLUMN "contactEmail" TEXT;

-- Add missing columns to User
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- Add missing columns to Patient
ALTER TABLE "Patient" ADD COLUMN "createdById" TEXT;

-- Add missing columns to Invoice
ALTER TABLE "Invoice" ADD COLUMN "serviceDate" TIMESTAMP(3);
ALTER TABLE "Invoice" ADD COLUMN "createdById" TEXT;

-- Add missing columns to Treatment
ALTER TABLE "Treatment" ADD COLUMN "createdById" TEXT;

-- CreateIndex: Campaign
CREATE UNIQUE INDEX "Campaign_id_tenantId_key" ON "Campaign"("id", "tenantId");
CREATE INDEX "Campaign_tenantId_idx" ON "Campaign"("tenantId");
CREATE INDEX "Campaign_tenantId_status_idx" ON "Campaign"("tenantId", "status");

-- CreateIndex: InventoryItem
CREATE UNIQUE INDEX "InventoryItem_id_tenantId_key" ON "InventoryItem"("id", "tenantId");
CREATE INDEX "InventoryItem_tenantId_idx" ON "InventoryItem"("tenantId");
CREATE INDEX "InventoryItem_tenantId_category_idx" ON "InventoryItem"("tenantId", "category");
CREATE INDEX "InventoryItem_expiresAt_idx" ON "InventoryItem"("expiresAt");
CREATE INDEX "InventoryItem_tenantId_quantity_idx" ON "InventoryItem"("tenantId", "quantity");

-- CreateIndex: PatientDocument
CREATE UNIQUE INDEX "PatientDocument_id_tenantId_key" ON "PatientDocument"("id", "tenantId");
CREATE INDEX "PatientDocument_tenantId_idx" ON "PatientDocument"("tenantId");
CREATE INDEX "PatientDocument_patientId_idx" ON "PatientDocument"("patientId");
CREATE INDEX "PatientDocument_tenantId_patientId_idx" ON "PatientDocument"("tenantId", "patientId");

-- CreateIndex: PushSubscription
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");
CREATE UNIQUE INDEX "PushSubscription_id_tenantId_key" ON "PushSubscription"("id", "tenantId");
CREATE INDEX "PushSubscription_tenantId_idx" ON "PushSubscription"("tenantId");

-- AddForeignKey: Campaign
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: InventoryItem
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: PatientDocument
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: PushSubscription
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Patient createdBy
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Invoice createdBy
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Treatment createdBy
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
