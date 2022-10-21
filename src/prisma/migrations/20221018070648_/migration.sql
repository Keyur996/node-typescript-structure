-- AlterTable
CREATE SEQUENCE "organizations_owner_id_seq";
ALTER TABLE "organizations" ALTER COLUMN "owner_id" SET DEFAULT nextval('organizations_owner_id_seq');
ALTER SEQUENCE "organizations_owner_id_seq" OWNED BY "organizations"."owner_id";
