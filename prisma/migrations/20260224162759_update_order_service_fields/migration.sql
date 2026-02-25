/*
  Warnings:

  - You are about to drop the column `service_expedition_id` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `service_expedition_name` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_service_expedition_id_fkey`;

-- DropIndex
DROP INDEX `orders_service_expedition_id_fkey` ON `orders`;

-- AlterTable
ALTER TABLE `orders` DROP COLUMN `service_expedition_id`,
    DROP COLUMN `service_expedition_name`,
    ADD COLUMN `service` VARCHAR(255) NULL,
    ADD COLUMN `service_name` VARCHAR(255) NULL,
    ADD COLUMN `service_type` VARCHAR(255) NULL;
