/*
  Warnings:

  - You are about to drop the column `created_by` on the `expeditions` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_by` on the `expeditions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `expeditions` table. All the data in the column will be lost.
  - You are about to drop the `cities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customer_addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `districts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `provinces` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `cities` DROP FOREIGN KEY `cities_province_id_fkey`;

-- DropForeignKey
ALTER TABLE `customer_addresses` DROP FOREIGN KEY `customer_addresses_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `customer_addresses` DROP FOREIGN KEY `customer_addresses_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `customer_addresses` DROP FOREIGN KEY `customer_addresses_district_id_fkey`;

-- DropForeignKey
ALTER TABLE `customer_addresses` DROP FOREIGN KEY `customer_addresses_updated_by_fkey`;

-- DropForeignKey
ALTER TABLE `customers` DROP FOREIGN KEY `customers_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `customers` DROP FOREIGN KEY `customers_updated_by_fkey`;

-- DropForeignKey
ALTER TABLE `districts` DROP FOREIGN KEY `districts_city_id_fkey`;

-- DropForeignKey
ALTER TABLE `expeditions` DROP FOREIGN KEY `expeditions_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `expeditions` DROP FOREIGN KEY `expeditions_deleted_by_fkey`;

-- DropForeignKey
ALTER TABLE `expeditions` DROP FOREIGN KEY `expeditions_updated_by_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_items` DROP FOREIGN KEY `order_items_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_address_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_deleted_by_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_district_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_expedition_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_payment_method_id_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_processed_by_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_updated_by_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_deleted_by_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_updated_by_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_deleted_by_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_updated_by_fkey`;

-- DropIndex
DROP INDEX `expeditions_created_by_fkey` ON `expeditions`;

-- DropIndex
DROP INDEX `expeditions_deleted_by_fkey` ON `expeditions`;

-- DropIndex
DROP INDEX `expeditions_updated_by_fkey` ON `expeditions`;

-- AlterTable
ALTER TABLE `expeditions` DROP COLUMN `created_by`,
    DROP COLUMN `deleted_by`,
    DROP COLUMN `updated_by`,
    MODIFY `code` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `refresh_token` TEXT NULL;

-- DropTable
DROP TABLE `cities`;

-- DropTable
DROP TABLE `customer_addresses`;

-- DropTable
DROP TABLE `customers`;

-- DropTable
DROP TABLE `districts`;

-- DropTable
DROP TABLE `order_items`;

-- DropTable
DROP TABLE `orders`;

-- DropTable
DROP TABLE `payments`;

-- DropTable
DROP TABLE `products`;

-- DropTable
DROP TABLE `provinces`;
