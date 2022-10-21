-- CreateEnum
CREATE TYPE "status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "organizationCategory" AS ENUM ('ECommerceBusiness', 'ProfessionalServices', 'Healthcare', 'ComputerSoftware', 'FinancialServices', 'Other');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "added_by" INTEGER,
    "birth_date" DATE,
    "website" TEXT,
    "fax" TEXT,
    "gender" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "active" "status" NOT NULL DEFAULT 'ACTIVE',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_time" TIMESTAMP(3),
    "report_to" INTEGER,
    "apple_id" INTEGER,
    "google_id" INTEGER,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "organization_category" "organizationCategory",
    "name" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "fax" TEXT,
    "website" TEXT,
    "description" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zip" TEXT,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_organizations" (
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,

    CONSTRAINT "users_organizations_pkey" PRIMARY KEY ("user_id","organization_id")
);

-- CreateTable
CREATE TABLE "platforms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" "status" NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_platforms" (
    "user_id" INTEGER NOT NULL,
    "platform_id" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "users_platforms_pkey" PRIMARY KEY ("user_id","platform_id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_profiles" (
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,

    CONSTRAINT "users_profiles_pkey" PRIMARY KEY ("user_id","organization_id","profile_id")
);

-- CreateTable
CREATE TABLE "permission_groups" (
    "id" SERIAL NOT NULL,
    "platform_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "status" NOT NULL,

    CONSTRAINT "permission_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "permission_group_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" "status" NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles_permissions" (
    "permission_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "status" "status" NOT NULL,

    CONSTRAINT "profiles_permissions_pkey" PRIMARY KEY ("permission_id","profile_id","organization_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_deleted_at_key" ON "users"("username", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_deleted_at_key" ON "users"("email", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_id_deleted_at_key" ON "users"("apple_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_deleted_at_key" ON "users"("google_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_uuid_deleted_at_key" ON "organizations"("uuid", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "platforms_name_key" ON "platforms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_name_organization_id_deleted_at_key" ON "profiles"("name", "organization_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "permission_groups_name_key" ON "permission_groups"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_report_to_fkey" FOREIGN KEY ("report_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_organizations" ADD CONSTRAINT "users_organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_organizations" ADD CONSTRAINT "users_organizations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_platforms" ADD CONSTRAINT "users_platforms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_platforms" ADD CONSTRAINT "users_platforms_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_platforms" ADD CONSTRAINT "users_platforms_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_profiles" ADD CONSTRAINT "users_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_profiles" ADD CONSTRAINT "users_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_profiles" ADD CONSTRAINT "users_profiles_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_groups" ADD CONSTRAINT "permission_groups_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles_permissions" ADD CONSTRAINT "profiles_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles_permissions" ADD CONSTRAINT "profiles_permissions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles_permissions" ADD CONSTRAINT "profiles_permissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
