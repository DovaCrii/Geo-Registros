-- Add soft delete to CostCenter
ALTER TABLE "CostCenter" ADD COLUMN "deletedAt" TIMESTAMP(3);
