<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, PUT, POST, OPTIONS');
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
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        return $_POST;
    }

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
                destination_managers.profile_picture,
                destination_managers.updated_at,
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
        'profilePictureUrl' => $row['profile_picture']
            ? 'manager-profile-image.php?v=' . rawurlencode($row['updated_at'])
            : null,
    ];
}

function profileImageStorageDirectory(): string
{
    return dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'manager-profile-images';
}

function validateAndStoreProfilePicture(): array
{
    $upload = $_FILES['profilePicture'] ?? null;

    if (!is_array($upload) || !isset($upload['error'], $upload['size'], $upload['tmp_name'])) {
        respond(422, ['ok' => false, 'message' => 'Choose a profile picture before saving.']);
    }

    if ($upload['error'] === UPLOAD_ERR_INI_SIZE || $upload['error'] === UPLOAD_ERR_FORM_SIZE) {
        respond(422, ['ok' => false, 'message' => 'Image must not exceed 5 MB']);
    }

    if ($upload['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($upload['tmp_name'])) {
        respond(422, ['ok' => false, 'message' => 'Unable to read the selected profile picture.']);
    }

    if ((int) $upload['size'] > 5 * 1024 * 1024) {
        respond(422, ['ok' => false, 'message' => 'Image must not exceed 5 MB']);
    }

    $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($upload['tmp_name']);
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    if (!isset($extensions[$mimeType]) || getimagesize($upload['tmp_name']) === false) {
        respond(422, ['ok' => false, 'message' => 'Choose a PNG, WEBP, JPG, or JPEG image.']);
    }

    $storageDirectory = profileImageStorageDirectory();

    if (!is_dir($storageDirectory) && !mkdir($storageDirectory, 0755, true) && !is_dir($storageDirectory)) {
        respond(500, ['ok' => false, 'message' => 'Unable to prepare profile image storage.']);
    }

    $filename = bin2hex(random_bytes(24)) . '.' . $extensions[$mimeType];
    $path = $storageDirectory . DIRECTORY_SEPARATOR . $filename;

    if (!move_uploaded_file($upload['tmp_name'], $path)) {
        respond(500, ['ok' => false, 'message' => 'Unable to save the profile picture.']);
    }

    return ['filename' => $filename, 'path' => $path];
}

$newPicturePath = null;

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

    if ($method === 'PUT' || $method === 'POST') {
        $statement = $pdo->prepare(profileSelect());
        $statement->execute(['user_id' => $userId]);
        $currentProfile = $statement->fetch();

        if (!$currentProfile) {
            respond(404, ['ok' => false, 'message' => 'Destination manager profile not found.']);
        }

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

        $newPicture = $method === 'POST' ? validateAndStoreProfilePicture() : null;
        $newPicturePath = $newPicture['path'] ?? null;
        $previousPicture = $currentProfile['profile_picture'];

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

        $managerSql = 'UPDATE destination_managers SET
                first_name = :first_name,
                middle_name = :middle_name,
                last_name = :last_name,
                extension_name = :extension_name,
                contact_number = :contact_number';
        $managerValues = [
            'first_name' => $fields['first_name'],
            'middle_name' => $fields['middle_name'],
            'last_name' => $fields['last_name'],
            'extension_name' => $fields['extension_name'],
            'contact_number' => $fields['contact_number'],
            'user_id' => $userId,
        ];

        if ($newPicture) {
            $managerSql .= ', profile_picture = :profile_picture';
            $managerValues['profile_picture'] = $newPicture['filename'];
        }

        $managerSql .= ' WHERE user_id = :user_id';
        $statement = $pdo->prepare($managerSql);
        $statement->execute($managerValues);

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
        $newPicturePath = null;

        if ($newPicture && $previousPicture) {
            $previousFilename = basename((string) $previousPicture);
            $previousPath = profileImageStorageDirectory() . DIRECTORY_SEPARATOR . $previousFilename;

            if ($previousFilename === $previousPicture && is_file($previousPath)) {
                unlink($previousPath);
            }
        }

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

    if ($newPicturePath && is_file($newPicturePath)) {
        unlink($newPicturePath);
    }

    if ((string) $exception->getCode() === '23000') {
        respond(409, ['ok' => false, 'message' => 'That email address or username is already in use.']);
    }

    respond(500, ['ok' => false, 'message' => 'Unable to update the business profile.']);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if ($newPicturePath && is_file($newPicturePath)) {
        unlink($newPicturePath);
    }

    respond(500, ['ok' => false, 'message' => 'Unable to update the business profile.']);
}
