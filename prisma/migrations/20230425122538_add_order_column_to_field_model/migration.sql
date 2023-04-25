/*
  Warnings:

  - A unique constraint covering the columns `[questionnaireId,order]` on the table `Field` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `Field` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Field" ADD COLUMN     "order" INT4 NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Field_questionnaireId_order_key" ON "Field"("questionnaireId", "order");
