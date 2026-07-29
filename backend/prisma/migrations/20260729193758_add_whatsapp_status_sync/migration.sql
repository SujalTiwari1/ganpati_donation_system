-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "whatsapp_status" ADD VALUE 'PENDING';
ALTER TYPE "whatsapp_status" ADD VALUE 'READ';
ALTER TYPE "whatsapp_status" ADD VALUE 'SKIPPED';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "provider_media_id" TEXT,
ADD COLUMN     "provider_message_id" TEXT,
ADD COLUMN     "whatsapp_delivered_at" TIMESTAMPTZ,
ADD COLUMN     "whatsapp_failure_reason" TEXT,
ADD COLUMN     "whatsapp_read_at" TIMESTAMPTZ,
ALTER COLUMN "whatsapp_status" SET DEFAULT 'PENDING';
