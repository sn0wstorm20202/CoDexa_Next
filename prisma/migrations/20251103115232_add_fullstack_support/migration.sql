-- AlterTable
ALTER TABLE "public"."Fragment" ADD COLUMN     "architecture" TEXT NOT NULL DEFAULT 'frontend',
ADD COLUMN     "backendUrl" TEXT,
ADD COLUMN     "dbSchema" JSONB,
ADD COLUMN     "dbType" TEXT,
ADD COLUMN     "seedData" JSONB;
