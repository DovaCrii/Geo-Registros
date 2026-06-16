-- Add soft delete to Client
ALTER TABLE "Client" ADD COLUMN "deletedAt" TIMESTAMP(3);
