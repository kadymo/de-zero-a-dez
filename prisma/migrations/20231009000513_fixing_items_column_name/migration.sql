/*
  Warnings:

  - You are about to drop the column `itens_0` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_1` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_10` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_2` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_3` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_4` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_5` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_6` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_7` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_8` on the `rankings` table. All the data in the column will be lost.
  - You are about to drop the column `itens_9` on the `rankings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rankings" DROP COLUMN "itens_0",
DROP COLUMN "itens_1",
DROP COLUMN "itens_10",
DROP COLUMN "itens_2",
DROP COLUMN "itens_3",
DROP COLUMN "itens_4",
DROP COLUMN "itens_5",
DROP COLUMN "itens_6",
DROP COLUMN "itens_7",
DROP COLUMN "itens_8",
DROP COLUMN "itens_9",
ADD COLUMN     "items_0" TEXT[],
ADD COLUMN     "items_1" TEXT[],
ADD COLUMN     "items_10" TEXT[],
ADD COLUMN     "items_2" TEXT[],
ADD COLUMN     "items_3" TEXT[],
ADD COLUMN     "items_4" TEXT[],
ADD COLUMN     "items_5" TEXT[],
ADD COLUMN     "items_6" TEXT[],
ADD COLUMN     "items_7" TEXT[],
ADD COLUMN     "items_8" TEXT[],
ADD COLUMN     "items_9" TEXT[];
