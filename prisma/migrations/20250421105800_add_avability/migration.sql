-- CreateTable
CREATE TABLE "OrganizationAvailability" (
    "id" TEXT NOT NULL,
    "mondayOpen" BOOLEAN NOT NULL DEFAULT true,
    "tuesdayOpen" BOOLEAN NOT NULL DEFAULT true,
    "wednesdayOpen" BOOLEAN NOT NULL DEFAULT true,
    "thursdayOpen" BOOLEAN NOT NULL DEFAULT true,
    "fridayOpen" BOOLEAN NOT NULL DEFAULT true,
    "saturdayOpen" BOOLEAN NOT NULL DEFAULT true,
    "sundayOpen" BOOLEAN NOT NULL DEFAULT false,
    "openingTime" INTEGER NOT NULL DEFAULT 540,
    "closingTime" INTEGER NOT NULL DEFAULT 1080,
    "lunchBreakStart" INTEGER,
    "lunchBreakEnd" INTEGER,
    "appointmentInterval" INTEGER NOT NULL DEFAULT 15,
    "preparationTime" INTEGER NOT NULL DEFAULT 0,
    "cleanupTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "OrganizationAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationAvailability_organizationId_key" ON "OrganizationAvailability"("organizationId");

-- AddForeignKey
ALTER TABLE "OrganizationAvailability" ADD CONSTRAINT "OrganizationAvailability_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
