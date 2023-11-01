/*
  Warnings:

  - You are about to drop the column `items_0` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_1` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_10` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_2` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_3` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_4` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_5` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_6` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_7` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_8` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `items_9` on the `rankings` table. All the data in the column will be lost.
  - Added the required column `columns` to the `rankings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rankings" DROP COLUMN "items_0",
DROP COLUMN "items_1",
DROP COLUMN "items_10",
DROP COLUMN "items_2",
DROP COLUMN "items_3",
DROP COLUMN "items_4",
DROP COLUMN "items_5",
DROP COLUMN "items_6",
DROP COLUMN "items_7",
DROP COLUMN "items_8",
DROP COLUMN "items_9",
ADD COLUMN     "columns" JSONB NOT NULL;
