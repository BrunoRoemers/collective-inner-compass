---refactor token table
ALTER TABLE "AuthToken" RENAME TO "Token";
ALTER TABLE "Token" RENAME CONSTRAINT "AuthToken_pkey" TO "Token_pkey";
ALTER TABLE "Token" RENAME CONSTRAINT "AuthToken_userId_fkey" TO "Token_userId_fkey";
ALTER TABLE "Token" RENAME COLUMN "invalidatedAt" TO "consumedAt";