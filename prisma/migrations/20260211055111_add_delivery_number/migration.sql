/*
  Warnings:

  - A unique constraint covering the columns `[delivery_number]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `orders` ADD COLUMN `delivery_number` VARCHAR(50) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `orders_delivery_number_key` ON `orders`(`delivery_number`);
