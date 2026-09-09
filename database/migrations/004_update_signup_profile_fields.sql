USE `jhopping`;

ALTER TABLE `user_personal_information`
    DROP COLUMN `birth_place`,
    ADD COLUMN `gender` ENUM('male', 'female', 'bisexual', 'gay', 'lesbian', 'prefer_not_to_say')
        NOT NULL DEFAULT 'prefer_not_to_say' AFTER `birth_date`;

ALTER TABLE `user_contact_information`
    DROP COLUMN `city`,
    DROP COLUMN `province`,
    DROP COLUMN `barangay`;
