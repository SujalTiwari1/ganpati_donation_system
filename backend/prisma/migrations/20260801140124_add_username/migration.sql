-- AlterTable
ALTER TABLE "users" ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password_changed_at" TIMESTAMPTZ,
ADD COLUMN     "username" VARCHAR(100),
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "mobile" DROP NOT NULL;
