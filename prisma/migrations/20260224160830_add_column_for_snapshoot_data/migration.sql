/*
  Warnings:

  - Added the required column `product_name` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_sku` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_address_full` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_city` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_country_code` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_district` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_phone` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_province` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_sub_district` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_zip_code` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method_name` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `product_height` DOUBLE NULL,
    ADD COLUMN `product_length` DOUBLE NULL,
    ADD COLUMN `product_name` VARCHAR(255) NOT NULL,
    ADD COLUMN `product_sku` VARCHAR(100) NOT NULL,
    ADD COLUMN `product_weight` INTEGER NULL,
    ADD COLUMN `product_width` DOUBLE NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `customer_address_full` TEXT NOT NULL,
    ADD COLUMN `customer_city` VARCHAR(100) NOT NULL,
    ADD COLUMN `customer_country_code` VARCHAR(10) NOT NULL,
    ADD COLUMN `customer_district` VARCHAR(100) NOT NULL,
    ADD COLUMN `customer_name` VARCHAR(255) NOT NULL,
    ADD COLUMN `customer_phone` VARCHAR(20) NOT NULL,
    ADD COLUMN `customer_province` VARCHAR(100) NOT NULL,
    ADD COLUMN `customer_sub_district` VARCHAR(100) NOT NULL,
    ADD COLUMN `customer_zip_code` VARCHAR(20) NOT NULL,
    ADD COLUMN `payment_method_name` VARCHAR(255) NOT NULL,
    ADD COLUMN `service_expedition_name` VARCHAR(255) NULL;
