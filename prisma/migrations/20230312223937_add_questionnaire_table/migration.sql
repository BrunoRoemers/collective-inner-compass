-- CreateTable
CREATE TABLE "Questionnaire" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" STRING NOT NULL,

    CONSTRAINT "Questionnaire_pkey" PRIMARY KEY ("id")
);
