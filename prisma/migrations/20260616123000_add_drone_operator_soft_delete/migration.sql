-- Add soft delete to Drone
ALTER TABLE "Drone" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Add soft delete to Operator
ALTER TABLE "Operator" ADD COLUMN "deletedAt" TIMESTAMP(3);
