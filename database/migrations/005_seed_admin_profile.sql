USE `jhopping`;

UPDATE `users`
SET `password_hash` = '$2y$10$FKPnKDDnNz/3gWcJc.k1..uEfaSF6FGIrhqAQLC1dLF9emTzs5Ib2'
WHERE `username` = 'jiahadmin';

INSERT INTO `user_personal_information` (
    `user_id`, `first_name`, `middle_initial`, `last_name`, `extension_name`, `birth_date`, `gender`
)
SELECT `id`, 'Jiah', 'O', 'Quijano', NULL, '2003-07-27', 'female'
FROM `users`
WHERE `username` = 'jiahadmin'
ON DUPLICATE KEY UPDATE
    `first_name` = VALUES(`first_name`),
    `middle_initial` = VALUES(`middle_initial`),
    `last_name` = VALUES(`last_name`),
    `extension_name` = VALUES(`extension_name`),
    `birth_date` = VALUES(`birth_date`),
    `gender` = VALUES(`gender`);
