-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('NUMBER');

-- CreateTable
CREATE TABLE "Field" (
    "id" UUID NOT NULL,
    "questionnaireId" UUID NOT NULL,
    "type" "FieldType" NOT NULL,
    "params" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Field" ADD CONSTRAINT "Field_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "Questionnaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
