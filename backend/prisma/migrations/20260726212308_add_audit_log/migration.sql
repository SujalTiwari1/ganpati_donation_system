/*
  Warnings:

  - You are about to drop the column `device` on the `audit_logs` table. All the data in the column will be lost.
  - Changed the type of `entity` on the `audit_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditEntity" AS ENUM ('AUTH', 'BUILDING', 'TRANSACTION', 'SETTINGS', 'USER');

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "device",
ADD COLUMN     "entity_label" VARCHAR(255),
ADD COLUMN     "user_agent" TEXT,
DROP COLUMN "entity",
ADD COLUMN     "entity" "AuditEntity" NOT NULL;

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity_label" ON "audit_logs"("entity_label");
