USE `jhopping`;

ALTER TABLE `destination_managers`
    ADD COLUMN IF NOT EXISTS `profile_picture` VARCHAR(255) NULL AFTER `contact_number`;
