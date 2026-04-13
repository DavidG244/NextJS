/*
  Warnings:

  - You are about to drop the column `releasedate` on the `Game` table. All the data in the column will be lost.
  - Added the required column `releaseDate` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Console" ALTER COLUMN "releaseDate" SET DATA TYPE TIMESTAMP(0);

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "releasedate",
ADD COLUMN     "releaseDate" TIMESTAMP(0) NOT NULL;
