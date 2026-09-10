<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/database.php';
require __DIR__ . '/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Only POST requests are allowed.']);
    exit;
}

try {
    $pdo = getDatabaseConnection();
    $authenticated = requireAuthenticatedUser($pdo);
    $statement = $pdo->prepare('DELETE FROM auth_sessions WHERE id = :session_id');
    $statement->execute(['session_id' => $authenticated['session_id']]);

    echo json_encode(['ok' => true, 'message' => 'Signed out successfully.']);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Unable to sign out.']);
}
