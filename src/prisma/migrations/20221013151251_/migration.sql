/*
  Warnings:

  - A unique constraint covering the columns `[uuid,isDeleted]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organization_id,isDeleted]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,isDeleted]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email,isDeleted]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[apple_id,isDeleted]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[google_id,isDeleted]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "organizations_uuid_deleted_at_key";

-- DropIndex
DROP INDEX "profiles_name_organization_id_deleted_at_key";

-- DropIndex
DROP INDEX "users_apple_id_deleted_at_key";

-- DropIndex
DROP INDEX "users_email_deleted_at_key";

-- DropIndex
DROP INDEX "users_google_id_deleted_at_key";

-- DropIndex
DROP INDEX "users_username_deleted_at_key";

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_uuid_isDeleted_key" ON "organizations"("uuid", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_name_organization_id_isDeleted_key" ON "profiles"("name", "organization_id", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_isDeleted_key" ON "users"("username", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_isDeleted_key" ON "users"("email", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_id_isDeleted_key" ON "users"("apple_id", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_isDeleted_key" ON "users"("google_id", "isDeleted");
