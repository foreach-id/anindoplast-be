/*
  Warnings:

  - Added the required column `city_id` to the `customer_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city_name` to the `customer_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province_id` to the `customer_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province_name` to the `customer_addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer_addresses` ADD COLUMN `city_id` INTEGER NOT NULL,
    ADD COLUMN `city_name` VARCHAR(100) NOT NULL,
    ADD COLUMN `province_id` INTEGER NOT NULL,
    ADD COLUMN `province_name` VARCHAR(100) NOT NULL;
