/*
  Warnings:

  - Added the required column `hourAppointment` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `estimatedTime` on the `Appointment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "hourAppointment" TEXT NOT NULL,
DROP COLUMN "estimatedTime",
ADD COLUMN     "estimatedTime" INTEGER NOT NULL;
