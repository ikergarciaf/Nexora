-- CreateIndex
CREATE INDEX "Appointment_tenantId_idx" ON "Appointment"("tenantId");
-- CreateIndex
CREATE INDEX "Campaign_tenantId_idx" ON "Campaign"("tenantId");
-- CreateIndex
CREATE INDEX "Consent_tenantId_idx" ON "Consent"("tenantId");
-- CreateIndex
CREATE INDEX "InventoryItem_tenantId_idx" ON "InventoryItem"("tenantId");
-- CreateIndex
CREATE INDEX "Invoice_tenantId_idx" ON "Invoice"("tenantId");
-- CreateIndex
CREATE INDEX "Patient_tenantId_idx" ON "Patient"("tenantId");
-- CreateIndex
CREATE INDEX "PushSubscription_tenantId_idx" ON "PushSubscription"("tenantId");
-- CreateIndex
CREATE INDEX "Room_tenantId_idx" ON "Room"("tenantId");
-- CreateIndex
CREATE INDEX "Shift_tenantId_idx" ON "Shift"("tenantId");
-- CreateIndex
CREATE INDEX "TenantUser_tenantId_idx" ON "TenantUser"("tenantId");
-- CreateIndex
CREATE INDEX "Treatment_tenantId_idx" ON "Treatment"("tenantId");
