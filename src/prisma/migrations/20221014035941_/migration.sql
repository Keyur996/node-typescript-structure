/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid,is_deleted]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organization_id,is_deleted]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,is_deleted]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,is_deleted]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[apple_id,is_deleted]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[google_id,is_deleted]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "organizations_uuid_isDeleted_key";

-- DropIndex
DROP INDEX "profiles_name_organization_id_isDeleted_key";

-- DropIndex
DROP INDEX "users_apple_id_isDeleted_key";

-- DropIndex
DROP INDEX "users_email_isDeleted_key";

-- DropIndex
DROP INDEX "users_google_id_isDeleted_key";

-- DropIndex
DROP INDEX "users_username_isDeleted_key";

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "isDeleted",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "isDeleted",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isDeleted",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_owner" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_uuid_is_deleted_key" ON "organizations"("uuid", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_name_organization_id_is_deleted_key" ON "profiles"("name", "organization_id", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_is_deleted_key" ON "users"("username", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_is_deleted_key" ON "users"("email", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_id_is_deleted_key" ON "users"("apple_id", "is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_is_deleted_key" ON "users"("google_id", "is_deleted");
