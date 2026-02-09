-- CreateTable
CREATE TABLE `service_expeditions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `shipping_cod_percent` INTEGER NOT NULL,
    `shipping_cost_percent` INTEGER NOT NULL,
    `shipping_handling_cost_percent` INTEGER NOT NULL,
    `expedition_type` VARCHAR(255) NOT NULL,
    `status_active` VARCHAR(50) NOT NULL,
    `expedition_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `service_expeditions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_expeditions` ADD CONSTRAINT `service_expeditions_expedition_id_fkey` FOREIGN KEY (`expedition_id`) REFERENCES `expeditions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
