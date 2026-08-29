/*
  Warnings:

  - The values [AGENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `personnelId` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'SUPERVISEUR');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
COMMIT;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_personnelId_fkey";

-- DropIndex
DROP INDEX "User_personnelId_key";

-- AlterTable
ALTER TABLE "Personnel" ADD COLUMN     "faceDescriptor" TEXT,
ADD COLUMN     "photoReference" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "personnelId";
