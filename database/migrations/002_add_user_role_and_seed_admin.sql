USE `jhopping`;

ALTER TABLE `users`
    ADD COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user'
    AFTER `username`;

INSERT INTO `users` (`email`, `username`, `password_hash`, `role`)
VALUES (
    'admin@jhopping.com',
    'jiahadmin',
    '$2y$10$J/GEdChp.Ryf.YUnLV.BLu.lt.6nlPIkgq8bSaz9m359aOiAWIrQy',
    'admin'
)
ON DUPLICATE KEY UPDATE `role` = 'admin';
