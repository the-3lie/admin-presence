-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'AGENT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "personnelId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_personnelId_key" ON "User"("personnelId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "Personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
