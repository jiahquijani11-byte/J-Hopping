<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/database.php';
require __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    authRespond(405, 'Only GET requests are allowed.');
}

try {
    $pdo = getDatabaseConnection();
    $authenticated = requireAuthenticatedUser($pdo, 'manager');
    $statement = $pdo->prepare(
        'SELECT profile_picture FROM destination_managers WHERE user_id = :user_id LIMIT 1'
    );
    $statement->execute(['user_id' => $authenticated['user_id']]);
    $filename = $statement->fetchColumn();

    if (!$filename || basename((string) $filename) !== $filename) {
        authRespond(404, 'Profile picture not found.');
    }

    $path = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' .
        DIRECTORY_SEPARATOR . 'manager-profile-images' . DIRECTORY_SEPARATOR . $filename;

    if (!is_file($path)) {
        authRespond(404, 'Profile picture not found.');
    }

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($path);

    if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp'], true)) {
        authRespond(404, 'Profile picture not found.');
    }

    header('Content-Type: ' . $mimeType);
    header('Content-Length: ' . filesize($path));
    header('Cache-Control: private, max-age=3600');
    readfile($path);
} catch (Throwable $exception) {
    authRespond(500, 'Unable to load the profile picture.');
}
