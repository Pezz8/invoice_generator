/*
  Warnings:

  - You are about to drop the column `person_id` on the `bike_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `spot_id` on the `bike_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `unit_id` on the `bike_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_id` on the `invoice_parts` table. All the data in the column will be lost.
  - You are about to drop the column `assignment_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `unit_id` on the `invoices` table. All the data in the column will be lost.
  - You are about to drop the column `person_id` on the `unit_assignments` table. All the data in the column will be lost.
  - You are about to drop the column `unit_id` on the `unit_assignments` table. All the data in the column will be lost.
  - Added the required column `person_uuid` to the `bike_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `spot_uuid` to the `bike_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_uuid` to the `bike_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoice_uuid` to the `invoice_parts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_uuid` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `person_uuid` to the `unit_assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_uuid` to the `unit_assignments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "bike_registrations" DROP CONSTRAINT "bike_registrations_person_id_fkey";

-- DropForeignKey
ALTER TABLE "bike_registrations" DROP CONSTRAINT "bike_registrations_spot_id_fkey";

-- DropForeignKey
ALTER TABLE "bike_registrations" DROP CONSTRAINT "bike_registrations_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "invoice_parts" DROP CONSTRAINT "invoice_parts_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "unit_assignments" DROP CONSTRAINT "unit_assignments_person_id_fkey";

-- DropForeignKey
ALTER TABLE "unit_assignments" DROP CONSTRAINT "unit_assignments_unit_id_fkey";

-- AlterTable
ALTER TABLE "bike_registrations" DROP COLUMN "person_id",
DROP COLUMN "spot_id",
DROP COLUMN "unit_id",
ADD COLUMN     "person_uuid" TEXT NOT NULL,
ADD COLUMN     "spot_uuid" TEXT NOT NULL,
ADD COLUMN     "unit_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invoice_parts" DROP COLUMN "invoice_id",
ADD COLUMN     "invoice_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "invoices" DROP COLUMN "assignment_id",
DROP COLUMN "unit_id",
ADD COLUMN     "assignment_uuid" TEXT,
ADD COLUMN     "unit_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "unit_assignments" DROP COLUMN "person_id",
DROP COLUMN "unit_id",
ADD COLUMN     "person_uuid" TEXT NOT NULL,
ADD COLUMN     "unit_uuid" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "invoice_parts" ADD CONSTRAINT "invoice_parts_invoice_uuid_fkey" FOREIGN KEY ("invoice_uuid") REFERENCES "invoices"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_assignment_uuid_fkey" FOREIGN KEY ("assignment_uuid") REFERENCES "unit_assignments"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_unit_uuid_fkey" FOREIGN KEY ("unit_uuid") REFERENCES "units"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_assignments" ADD CONSTRAINT "unit_assignments_person_uuid_fkey" FOREIGN KEY ("person_uuid") REFERENCES "people"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_assignments" ADD CONSTRAINT "unit_assignments_unit_uuid_fkey" FOREIGN KEY ("unit_uuid") REFERENCES "units"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bike_registrations" ADD CONSTRAINT "bike_registrations_person_uuid_fkey" FOREIGN KEY ("person_uuid") REFERENCES "people"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bike_registrations" ADD CONSTRAINT "bike_registrations_spot_uuid_fkey" FOREIGN KEY ("spot_uuid") REFERENCES "bike_spots"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bike_registrations" ADD CONSTRAINT "bike_registrations_unit_uuid_fkey" FOREIGN KEY ("unit_uuid") REFERENCES "units"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
