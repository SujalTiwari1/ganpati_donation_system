/*
  Warnings:

  - You are about to drop the `buildings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `created_by_id` to the `donors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `festivals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "donors" DROP CONSTRAINT "donors_building_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_building_id_fkey";

-- AlterTable
ALTER TABLE "donors" ADD COLUMN     "created_by_id" UUID NOT NULL,
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "updated_by_id" UUID;

-- AlterTable
ALTER TABLE "festivals" ADD COLUMN     "created_by_id" UUID NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMPTZ,
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "updated_by_id" UUID;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "created_by_id" UUID NOT NULL,
ADD COLUMN     "deleted_by_id" UUID,
ADD COLUMN     "restored_at" TIMESTAMPTZ,
ADD COLUMN     "restored_by_id" UUID,
ADD COLUMN     "updated_by_id" UUID;

-- DropTable
DROP TABLE "buildings";

-- CreateTable
CREATE TABLE "Building" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "normalized_name" VARCHAR(200) NOT NULL,
    "area" VARCHAR(150),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "deleted_by_id" UUID,
    "deleted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Building_normalized_name_key" ON "Building"("normalized_name");

-- AddForeignKey
ALTER TABLE "festivals" ADD CONSTRAINT "festivals_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "festivals" ADD CONSTRAINT "festivals_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "festivals" ADD CONSTRAINT "festivals_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "Building"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_restored_by_id_fkey" FOREIGN KEY ("restored_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
