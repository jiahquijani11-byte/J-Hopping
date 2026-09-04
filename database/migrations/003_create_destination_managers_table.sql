USE `jhopping`;

ALTER TABLE `users`
    MODIFY COLUMN `role` ENUM('user', 'admin', 'manager') NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS `destination_managers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `business_name` VARCHAR(190) NOT NULL,
    `first_name` VARCHAR(80) NOT NULL,
    `middle_name` VARCHAR(80) NULL,
    `last_name` VARCHAR(80) NOT NULL,
    `extension_name` VARCHAR(30) NULL,
    `contact_number` VARCHAR(30) NOT NULL,
    `status` ENUM('active', 'pending', 'suspended') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `destination_managers_user_id_unique` (`user_id`),
    CONSTRAINT `destination_managers_user_id_foreign`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
