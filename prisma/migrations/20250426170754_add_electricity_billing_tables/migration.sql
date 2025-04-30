-- CreateTable
CREATE TABLE "electric_meters" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "unit_uuid" TEXT NOT NULL,
    "meter_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "electric_meters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "electric_readings" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "meter_uuid" TEXT NOT NULL,
    "reading_date" DATE NOT NULL,
    "reading_value" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "electric_readings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "electric_meters_uuid_key" ON "electric_meters"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "electric_readings_uuid_key" ON "electric_readings"("uuid");

-- AddForeignKey
ALTER TABLE "electric_meters" ADD CONSTRAINT "electric_meters_unit_uuid_fkey" FOREIGN KEY ("unit_uuid") REFERENCES "units"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "electric_readings" ADD CONSTRAINT "electric_readings_meter_uuid_fkey" FOREIGN KEY ("meter_uuid") REFERENCES "electric_meters"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
