/*
  Warnings:

  - Added the required column `sub_district_id` to the `customer_addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip_code` to the `customer_addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer_addresses` ADD COLUMN `sub_district_id` INTEGER NOT NULL,
    ADD COLUMN `zip_code` VARCHAR(20) NOT NULL;
