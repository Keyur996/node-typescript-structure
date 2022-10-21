-- DropForeignKey
ALTER TABLE "profiles_permissions" DROP CONSTRAINT "profiles_permissions_profile_id_fkey";

-- AlterTable
ALTER TABLE "organizations" ALTER COLUMN "owner_id" DROP DEFAULT;
DROP SEQUENCE "organizations_owner_id_seq";

-- AddForeignKey
ALTER TABLE "profiles_permissions" ADD CONSTRAINT "profiles_permissions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
