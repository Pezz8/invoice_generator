-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'tenant');

-- CreateEnum
CREATE TYPE "rack_position" AS ENUM ('upper', 'lower');

-- CreateTable
CREATE TABLE "invoice_parts" (
    "id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "part_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,
    "total_cost" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "invoice_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "assignment_id" INTEGER,
    "invoice_type" TEXT NOT NULL,
    "labor_hours" DECIMAL(5,2),
    "labor_cost" DECIMAL(10,2) DEFAULT 0,
    "parts_cost" DECIMAL(10,2) DEFAULT 0,
    "total_cost" DECIMAL(10,2),
    "job_date" DATE NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "people" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_assignments" (
    "id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "person_id" INTEGER NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN DEFAULT true,
    "start_date" DATE,

    CONSTRAINT "unit_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" SERIAL NOT NULL,
    "unit_number" TEXT NOT NULL,
    "affordable" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit_cost" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bike_registrations" (
    "id" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "spot_id" INTEGER NOT NULL,
    "make_model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "registration_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fee_paid_date" TIMESTAMP(6) NOT NULL,
    "next_due_date" TIMESTAMP(6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bike_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bike_spots" (
    "id" SERIAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "rack_position" "rack_position" NOT NULL,

    CONSTRAINT "bike_spots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "people_email_key" ON "people"("email");

-- CreateIndex
CREATE UNIQUE INDEX "units_unit_number_key" ON "units"("unit_number");

-- CreateIndex
CREATE UNIQUE INDEX "parts_name_key" ON "parts"("name");

-- AddForeignKey
ALTER TABLE "invoice_parts" ADD CONSTRAINT "invoice_parts_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "unit_assignments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_assignments" ADD CONSTRAINT "unit_assignments_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_assignments" ADD CONSTRAINT "unit_assignments_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bike_registrations" ADD CONSTRAINT "bike_registrations_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "people"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bike_registrations" ADD CONSTRAINT "bike_registrations_spot_id_fkey" FOREIGN KEY ("spot_id") REFERENCES "bike_spots"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bike_registrations" ADD CONSTRAINT "bike_registrations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
