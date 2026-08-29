-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('MASCULIN', 'FEMININ');

-- CreateEnum
CREATE TYPE "StatutPresence" AS ENUM ('PAS_ENCORE', 'PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPERVISEUR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Personnel" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "postnom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "sexe" "Sexe" NOT NULL,
    "contact" TEXT,
    "adresse" TEXT,
    "entreprise" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "departement" TEXT NOT NULL,
    "fonction" TEXT NOT NULL,
    "niveauEtude" TEXT,
    "dateEngagement" TIMESTAMP(3) NOT NULL,
    "qrToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carte" (
    "id" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "imageDataUrl" TEXT NOT NULL,
    "genereeLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "envoyeeLe" TIMESTAMP(3),

    CONSTRAINT "Carte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presence" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "heureArrivee" TIMESTAMP(3),
    "heureDepart" TIMESTAMP(3),
    "personnelId" TEXT NOT NULL,
    "statut" "StatutPresence" NOT NULL DEFAULT 'PAS_ENCORE',

    CONSTRAINT "Presence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_matricule_key" ON "Personnel"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Personnel_qrToken_key" ON "Personnel"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "Presence_personnelId_date_key" ON "Presence"("personnelId", "date");

-- AddForeignKey
ALTER TABLE "Carte" ADD CONSTRAINT "Carte_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "Personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "Personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
