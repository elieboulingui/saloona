-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "AppointmentService" ADD COLUMN     "barberId" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "note" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "AppointmentService" ADD CONSTRAINT "AppointmentService_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
