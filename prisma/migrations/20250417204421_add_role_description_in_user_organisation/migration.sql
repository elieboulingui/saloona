-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "imageCover" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "UserOrganization" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN';
