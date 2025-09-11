/*
  Warnings:

  - A unique constraint covering the columns `[batch_id]` on the table `BatchLifecycle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BatchLifecycle_batch_id_key" ON "BatchLifecycle"("batch_id");
