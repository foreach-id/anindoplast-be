/*
  Warnings:

  - You are about to drop the column `expedition_type` on the `service_expeditions` table. All the data in the column will be lost.
  - You are about to drop the column `status_active` on the `service_expeditions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `service_expeditions` DROP COLUMN `expedition_type`,
    DROP COLUMN `status_active`,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;
