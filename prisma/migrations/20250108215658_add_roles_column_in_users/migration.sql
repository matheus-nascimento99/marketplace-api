/*
  Warnings:

  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('SELLER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Roles" NOT NULL;
