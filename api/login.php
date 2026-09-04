<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/database.php';

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, [
        'ok' => false,
        'message' => 'Only POST requests are allowed.',
    ]);
}

$payload = json_decode(file_get_contents('php://input'), true);

if (!is_array($payload)) {
    respond(400, [
        'ok' => false,
        'message' => 'Invalid JSON payload.',
    ]);
}

$identifier = trim((string) ($payload['identifier'] ?? ''));
$password = (string) ($payload['password'] ?? '');

if ($identifier === '' || $password === '') {
    respond(422, [
        'ok' => false,
        'message' => 'Email or username and password are required.',
    ]);
}

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->prepare(
        'SELECT
            users.id,
            users.email,
            users.username,
            users.role,
            users.password_hash,
            user_personal_information.first_name,
            user_personal_information.last_name,
            destination_managers.first_name AS manager_first_name,
            destination_managers.last_name AS manager_last_name
         FROM users
         LEFT JOIN user_personal_information
            ON user_personal_information.user_id = users.id
         LEFT JOIN destination_managers
            ON destination_managers.user_id = users.id
         WHERE users.email = :email OR users.username = :username
         LIMIT 1'
    );
    $statement->execute([
        'email' => $identifier,
        'username' => $identifier,
    ]);

    $user = $statement->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        respond(401, [
            'ok' => false,
            'message' => 'Invalid email/username or password.',
        ]);
    }

    respond(200, [
        'ok' => true,
        'message' => 'Signed in successfully.',
        'data' => [
            'id' => $user['id'],
            'firstName' => $user['first_name'] ?? $user['manager_first_name'],
            'lastName' => $user['last_name'] ?? $user['manager_last_name'],
            'email' => $user['email'],
            'username' => $user['username'],
            'role' => $user['role'],
        ],
    ]);
} catch (Throwable $exception) {
    respond(500, [
        'ok' => false,
        'message' => 'Unable to sign in.',
        'error' => $exception->getMessage(),
    ]);
}
