-- DropForeignKey
ALTER TABLE "rankings" DROP CONSTRAINT "rankings_templateId_fkey";

-- DropForeignKey
ALTER TABLE "rankings" DROP CONSTRAINT "rankings_userId_fkey";

-- DropForeignKey
ALTER TABLE "templates" DROP CONSTRAINT "templates_userId_fkey";

-- AlterTable
ALTER TABLE "templates" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rankings" ADD CONSTRAINT "rankings_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
