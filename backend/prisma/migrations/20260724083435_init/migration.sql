-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "festival_status" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'OTHER');

-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "whatsapp_status" AS ENUM ('NOT_SENT', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "email_status" AS ENUM ('NOT_SENT', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'RECEIPT_REGENERATE', 'STATUS_CHANGE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "email" CITEXT NOT NULL,
    "mobile" VARCHAR(15) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'VOLUNTEER',
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMPTZ,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "festivals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "year" SMALLINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "festival_status" NOT NULL DEFAULT 'DRAFT',
    "last_receipt_seq" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "festivals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "normalized_name" VARCHAR(200) NOT NULL,
    "area" VARCHAR(150),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(150) NOT NULL,
    "mobile" VARCHAR(15) NOT NULL,
    "email" CITEXT,
    "building_id" UUID NOT NULL,
    "room_number" VARCHAR(20) NOT NULL,
    "remarks" TEXT,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "festival_id" UUID NOT NULL,
    "donor_id" UUID NOT NULL,
    "volunteer_id" UUID NOT NULL,
    "building_id" UUID NOT NULL,
    "receipt_number" VARCHAR(20) NOT NULL,
    "room_number" VARCHAR(20) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payment_method" "payment_method" NOT NULL,
    "status" "transaction_status" NOT NULL DEFAULT 'CONFIRMED',
    "whatsapp_status" "whatsapp_status" NOT NULL DEFAULT 'NOT_SENT',
    "email_status" "email_status" NOT NULL DEFAULT 'NOT_SENT',
    "donation_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receipt_generated" BOOLEAN NOT NULL DEFAULT false,
    "is_duplicate" BOOLEAN NOT NULL DEFAULT false,
    "duplicate_of_transaction_id" UUID,
    "duplicate_override_reason" TEXT,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SMALLINT NOT NULL DEFAULT 1,
    "mandal_name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "phone" VARCHAR(15),
    "email" CITEXT,
    "logo_url" TEXT,
    "receipt_prefix" VARCHAR(20) NOT NULL DEFAULT '',
    "show_volunteer_name" BOOLEAN NOT NULL DEFAULT true,
    "enable_whatsapp" BOOLEAN NOT NULL DEFAULT true,
    "enable_email" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "action" "audit_action" NOT NULL,
    "entity" VARCHAR(50) NOT NULL,
    "entity_id" UUID,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" INET,
    "device" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE INDEX "idx_users_status" ON "users"("status");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "festivals_year_key" ON "festivals"("year");

-- CreateIndex
CREATE INDEX "idx_festivals_status" ON "festivals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_normalized_name_key" ON "buildings"("normalized_name");

-- CreateIndex
CREATE INDEX "idx_buildings_area" ON "buildings"("area");

-- CreateIndex
CREATE INDEX "idx_buildings_name_trgm" ON "buildings" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_buildings_normalized_name_trgm" ON "buildings" USING GIN ("normalized_name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_donors_mobile" ON "donors"("mobile");

-- CreateIndex
CREATE INDEX "idx_donors_building_room" ON "donors"("building_id", "room_number");

-- CreateIndex
CREATE INDEX "idx_donors_name_trgm" ON "donors" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE UNIQUE INDEX "uq_donors_mobile_building_room" ON "donors"("mobile", "building_id", "room_number");

-- CreateIndex
CREATE INDEX "idx_transactions_receipt_number" ON "transactions"("receipt_number");

-- CreateIndex
CREATE INDEX "idx_transactions_dup_check" ON "transactions"("festival_id", "building_id", "room_number");

-- CreateIndex
CREATE INDEX "idx_transactions_festival_date" ON "transactions"("festival_id", "donation_date");

-- CreateIndex
CREATE INDEX "idx_transactions_volunteer" ON "transactions"("volunteer_id", "festival_id");

-- CreateIndex
CREATE INDEX "idx_transactions_donor" ON "transactions"("donor_id");

-- CreateIndex
CREATE INDEX "idx_transactions_building" ON "transactions"("building_id", "festival_id");

-- CreateIndex
CREATE INDEX "idx_transactions_payment_method" ON "transactions"("festival_id", "payment_method");

-- CreateIndex
CREATE INDEX "idx_transactions_status" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "idx_transactions_whatsapp_status" ON "transactions"("festival_id", "whatsapp_status");

-- CreateIndex
CREATE INDEX "idx_transactions_email_status" ON "transactions"("festival_id", "email_status");

-- CreateIndex
CREATE INDEX "idx_transactions_created_at" ON "transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_transactions_festival_receipt" ON "transactions"("festival_id", "receipt_number");

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_user" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_audit_logs_created_at" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_festival_id_fkey" FOREIGN KEY ("festival_id") REFERENCES "festivals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "donors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_duplicate_of_transaction_id_fkey" FOREIGN KEY ("duplicate_of_transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
