/*
  Warnings:

  - The `organization_category` column on the `organizations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "organization_category",
ADD COLUMN     "organization_category" TEXT;

-- DropEnum
DROP TYPE "organizationCategory";
