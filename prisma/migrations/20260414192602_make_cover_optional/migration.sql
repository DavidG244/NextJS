/*
  Warnings:

  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "cover" DROP NOT NULL,
ALTER COLUMN "cover" DROP DEFAULT;

-- DropTable
DROP TABLE "UserProfile";
