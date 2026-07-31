-- AlterTable
-- Adds username and mustChangePassword columns to the users table.
-- username is a unique, non-null varchar(100) for volunteer login identity.
-- mustChangePassword defaults to true so newly-created volunteers are
-- forced to set their own password on first login.

ALTER TABLE "users" ADD COLUMN "username" VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
