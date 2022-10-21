/*
  Warnings:

  - You are about to drop the column `is_owner` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `postal_code` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[owner_id]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `owner_id` to the `organizations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "email" TEXT,
ADD COLUMN     "organization_logo" TEXT,
ADD COLUMN     "owner_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_owner",
DROP COLUMN "postal_code",
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "profile_image" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "zip" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "organizations_owner_id_key" ON "organizations"("owner_id");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
