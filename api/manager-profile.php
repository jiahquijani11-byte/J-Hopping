<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require __DIR__ . '/database.php';
require __DIR__ . '/auth.php';

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function requestPayload(): array
{
    $payload = json_decode(file_get_contents('php://input'), true);

    if (!is_array($payload)) {
        respond(400, ['ok' => false, 'message' => 'Invalid JSON payload.']);
    }

    return $payload;
}

function requiredString(array $payload, string $key): string
{
    $value = trim((string) ($payload[$key] ?? ''));

    if ($value === '') {
        respond(422, [
            'ok' => false,
            'message' => ucfirst(str_replace('_', ' ', $key)) . ' is required.',
        ]);
    }

    return $value;
}

function validatePassword(string $password): void
{
    if (
        strlen($password) < 8 ||
        !preg_match('/[A-Z]/', $password) ||
        !preg_match('/[a-z]/', $password) ||
        !preg_match('/\d/', $password) ||
        !preg_match('/[^A-Za-z0-9]/', $password)
    ) {
        respond(422, [
            'ok' => false,
            'message' => 'Password must have at least 8 characters, uppercase, lowercase, number, and special character.',
        ]);
    }
}

function profileSelect(): string
{
    return 'SELECT
                destination_managers.business_name,
                destination_managers.first_name,
                destination_managers.middle_name,
                destination_managers.last_name,
                destination_managers.extension_name,
                destination_managers.contact_number,
                users.email,
                users.username
            FROM destination_managers
            INNER JOIN users ON users.id = destination_managers.user_id
            WHERE destination_managers.user_id = :user_id
            LIMIT 1';
}

function profileData(array $row): array
{
    return [
        'businessName' => $row['business_name'],
        'firstName' => $row['first_name'],
        'middleName' => $row['middle_name'],
        'lastName' => $row['last_name'],
        'extensionName' => $row['extension_name'],
        'email' => $row['email'],
        'contactNumber' => $row['contact_number'],
        'username' => $row['username'],
    ];
}

try {
    $pdo = getDatabaseConnection();
    $authenticated = requireAuthenticatedUser($pdo, 'manager');
    $userId = (int) $authenticated['user_id'];
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $statement = $pdo->prepare(profileSelect());
        $statement->execute(['user_id' => $userId]);
        $profile = $statement->fetch();

        if (!$profile) {
            respond(404, ['ok' => false, 'message' => 'Destination manager profile not found.']);
        }

        respond(200, ['ok' => true, 'data' => profileData($profile)]);
    }

    if ($method === 'PUT') {
        $payload = requestPayload();
        $email = strtolower(requiredString($payload, 'email'));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            respond(422, ['ok' => false, 'message' => 'Enter a valid email address.']);
        }

        $fields = [
            'first_name' => requiredString($payload, 'firstName'),
            'middle_name' => trim((string) ($payload['middleName'] ?? '')) ?: null,
            'last_name' => requiredString($payload, 'lastName'),
            'extension_name' => trim((string) ($payload['extensionName'] ?? '')) ?: null,
            'email' => $email,
            'contact_number' => requiredString($payload, 'contactNumber'),
            'username' => requiredString($payload, 'username'),
        ];
        $password = (string) ($payload['password'] ?? '');

        if ($password !== '') {
            validatePassword($password);
        }

        $statement = $pdo->prepare(
            'SELECT id FROM users
             WHERE id <> :user_id
               AND (email = :email OR username = :username)
             LIMIT 1'
        );
        $statement->execute([
            'user_id' => $userId,
            'email' => $fields['email'],
            'username' => $fields['username'],
        ]);

        if ($statement->fetch()) {
            respond(409, ['ok' => false, 'message' => 'That email address or username is already in use.']);
        }

        $pdo->beginTransaction();
        $userSql = 'UPDATE users SET email = :email, username = :username';
        $userValues = [
            'email' => $fields['email'],
            'username' => $fields['username'],
            'user_id' => $userId,
        ];

        if ($password !== '') {
            $userSql .= ', password_hash = :password_hash';
            $userValues['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        }

        $userSql .= " WHERE id = :user_id AND role = 'manager'";
        $statement = $pdo->prepare($userSql);
        $statement->execute($userValues);

        $statement = $pdo->prepare(
            'UPDATE destination_managers SET
                first_name = :first_name,
                middle_name = :middle_name,
                last_name = :last_name,
                extension_name = :extension_name,
                contact_number = :contact_number
             WHERE user_id = :user_id'
        );
        $statement->execute([
            'first_name' => $fields['first_name'],
            'middle_name' => $fields['middle_name'],
            'last_name' => $fields['last_name'],
            'extension_name' => $fields['extension_name'],
            'contact_number' => $fields['contact_number'],
            'user_id' => $userId,
        ]);

        if ($statement->rowCount() === 0) {
            $checkStatement = $pdo->prepare(
                'SELECT id FROM destination_managers WHERE user_id = :user_id LIMIT 1'
            );
            $checkStatement->execute(['user_id' => $userId]);

            if (!$checkStatement->fetch()) {
                $pdo->rollBack();
                respond(404, ['ok' => false, 'message' => 'Destination manager profile not found.']);
            }
        }

        $pdo->commit();
        $statement = $pdo->prepare(profileSelect());
        $statement->execute(['user_id' => $userId]);

        respond(200, [
            'ok' => true,
            'message' => 'Business Profile Updated Successfully',
            'data' => profileData($statement->fetch()),
        ]);
    }

    respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
} catch (PDOException $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if ((string) $exception->getCode() === '23000') {
        respond(409, ['ok' => false, 'message' => 'That email address or username is already in use.']);
    }

    respond(500, ['ok' => false, 'message' => 'Unable to update the business profile.']);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    respond(500, ['ok' => false, 'message' => 'Unable to update the business profile.']);
}
