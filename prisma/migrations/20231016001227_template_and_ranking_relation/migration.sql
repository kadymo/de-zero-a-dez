/*
  Warnings:

  - You are about to drop the column `isPublic` on the `rankings` table. All the data in the column will be lost.
  - Added the required column `templateId` to the `rankings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rankings" DROP COLUMN "isPublic",
ADD COLUMN     "templateId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
