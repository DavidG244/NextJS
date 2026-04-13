/*
  Warnings:

  - Added the required column `releasedate` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "releasedate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "cover" SET DEFAULT 'no-cover.png';
