-- Add vigency/expiry fields for Drone and Operator

ALTER TABLE "Drone" ADD COLUMN "insuranceExpiry" TIMESTAMP(3);
ALTER TABLE "Operator" ADD COLUMN "licenseExpiry" TIMESTAMP(3);
