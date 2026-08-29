-- Cette migration restaure ce que la migration précédente
-- (20260827105656_presence_app) avait supprimé : la valeur AGENT du rôle
-- utilisateur et la liaison User -> Personnel. C'est nécessaire pour
-- l'application mobile Agent (chaque agent a un compte AGENT lié à sa
-- fiche Personnel).

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'AGENT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "personnelId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_personnelId_key" ON "User"("personnelId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "Personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
