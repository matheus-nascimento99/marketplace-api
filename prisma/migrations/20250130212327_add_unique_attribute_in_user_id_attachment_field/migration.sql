/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `attachments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attachments_user_id_key" ON "attachments"("user_id");
