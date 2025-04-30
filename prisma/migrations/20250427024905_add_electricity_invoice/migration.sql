-- AlterTable
ALTER TABLE "electric_readings" ADD COLUMN     "invoice_uuid" TEXT;

-- CreateTable
CREATE TABLE "electricity_invoices" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "unit_uuid" TEXT NOT NULL,
    "billing_start" DATE NOT NULL,
    "billing_end" DATE NOT NULL,
    "total_usage" DECIMAL(10,2) NOT NULL,
    "supply_charge" DECIMAL(10,2) NOT NULL,
    "delivery_charge" DECIMAL(10,2) NOT NULL,
    "total_charge" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "electricity_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "electricity_invoices_uuid_key" ON "electricity_invoices"("uuid");

-- AddForeignKey
ALTER TABLE "electricity_invoices" ADD CONSTRAINT "electricity_invoices_unit_uuid_fkey" FOREIGN KEY ("unit_uuid") REFERENCES "units"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electric_readings" ADD CONSTRAINT "electric_readings_invoice_uuid_fkey" FOREIGN KEY ("invoice_uuid") REFERENCES "electricity_invoices"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
