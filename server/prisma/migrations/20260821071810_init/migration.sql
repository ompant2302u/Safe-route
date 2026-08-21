-- CreateEnum
CREATE TYPE "HazardType" AS ENUM ('LANDSLIDE', 'FLOOD', 'FIRE', 'ROAD_BLOCKAGE', 'EARTHQUAKE_DAMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SafePlaceType" AS ENUM ('HOSPITAL', 'POLICE', 'SHELTER', 'OPEN_GROUND', 'HEALTH_POST', 'FIRE_STATION', 'OTHER');

-- CreateEnum
CREATE TYPE "SafePlaceStatus" AS ENUM ('AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HazardReport" (
    "id" SERIAL NOT NULL,
    "type" "HazardType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "photoUrl" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" INTEGER,

    CONSTRAINT "HazardReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hazard" (
    "id" SERIAL NOT NULL,
    "type" "HazardType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'community',
    "reportId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hazard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafePlace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SafePlaceType" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "status" "SafePlaceStatus" NOT NULL DEFAULT 'UNKNOWN',
    "contactNumber" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafePlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Hazard_reportId_key" ON "Hazard"("reportId");

-- AddForeignKey
ALTER TABLE "HazardReport" ADD CONSTRAINT "HazardReport_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hazard" ADD CONSTRAINT "Hazard_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "HazardReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
