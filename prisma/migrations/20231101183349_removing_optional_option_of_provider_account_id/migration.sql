/*
  Warnings:

  - Made the column `provider_account_id` on table `accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "provider_account_id" SET NOT NULL;
