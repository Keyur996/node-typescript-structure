/*
  Warnings:

  - The primary key for the `users_platforms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `organizationId` on the `users_platforms` table. All the data in the column will be lost.
  - Added the required column `organization_id` to the `users_platforms` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "users_platforms" DROP CONSTRAINT "users_platforms_organizationId_fkey";

-- AlterTable
ALTER TABLE "users_platforms" DROP CONSTRAINT "users_platforms_pkey",
DROP COLUMN "organizationId",
ADD COLUMN     "organization_id" INTEGER NOT NULL,
ADD CONSTRAINT "users_platforms_pkey" PRIMARY KEY ("user_id", "platform_id", "organization_id");

-- AddForeignKey
ALTER TABLE "users_platforms" ADD CONSTRAINT "users_platforms_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
