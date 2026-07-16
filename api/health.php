<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require __DIR__ . '/database.php';

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->query('SELECT DATABASE() AS database_name, NOW() AS server_time');

    http_response_code(200);
    echo json_encode([
        'ok' => true,
        'message' => 'Connected to MySQL successfully.',
        'data' => $statement->fetch(),
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Database connection failed.',
        'error' => $exception->getMessage(),
    ]);
}
