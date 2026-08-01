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

$firstName = requiredString($payload, 'firstName');
$lastName = requiredString($payload, 'lastName');
$birthDate = requiredString($payload, 'birthDate');
$birthPlace = requiredString($payload, 'birthPlace');
$email = strtolower(requiredString($payload, 'email'));
$contactNumber = requiredString($payload, 'contactNumber');
$city = requiredString($payload, 'city');
$province = requiredString($payload, 'province');
$barangay = requiredString($payload, 'barangay');
$country = requiredString($payload, 'country');
$username = requiredString($payload, 'username');
$password = (string) ($payload['password'] ?? '');
$middleInitial = trim((string) ($payload['middleInitial'] ?? ''));
$extensionName = trim((string) ($payload['extensionName'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, [
        'ok' => false,
        'message' => 'Enter a valid email address.',
    ]);
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthDate)) {
    respond(422, [
        'ok' => false,
        'message' => 'Birth date must use YYYY-MM-DD format.',
    ]);
}

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

try {
    $pdo = getDatabaseConnection();

    $statement = $pdo->prepare('SELECT email, username FROM users WHERE email = :email OR username = :username LIMIT 1');
    $statement->execute([
        'email' => $email,
        'username' => $username,
    ]);
    $existingUser = $statement->fetch();

    if ($existingUser) {
        if (strtolower($existingUser['email']) === $email) {
            respond(409, [
                'ok' => false,
                'message' => 'This email address already exists.',
            ]);
        }

        respond(409, [
            'ok' => false,
            'message' => 'This username already exists.',
        ]);
    }

    $pdo->beginTransaction();

    $statement = $pdo->prepare(
        'INSERT INTO users (email, username, password_hash)
         VALUES (:email, :username, :password_hash)'
    );
    $statement->execute([
        'email' => $email,
        'username' => $username,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ]);

    $userId = $pdo->lastInsertId();

    $statement = $pdo->prepare(
        'INSERT INTO user_personal_information (
            user_id,
            first_name,
            middle_initial,
            last_name,
            extension_name,
            birth_date,
            birth_place
        ) VALUES (
            :user_id,
            :first_name,
            :middle_initial,
            :last_name,
            :extension_name,
            :birth_date,
            :birth_place
        )'
    );
    $statement->execute([
        'user_id' => $userId,
        'first_name' => $firstName,
        'middle_initial' => $middleInitial !== '' ? $middleInitial : null,
        'last_name' => $lastName,
        'extension_name' => $extensionName !== '' ? $extensionName : null,
        'birth_date' => $birthDate,
        'birth_place' => $birthPlace,
    ]);

    $statement = $pdo->prepare(
        'INSERT INTO user_contact_information (
            user_id,
            contact_number,
            city,
            province,
            barangay,
            country
        ) VALUES (
            :user_id,
            :contact_number,
            :city,
            :province,
            :barangay,
            :country
        )'
    );
    $statement->execute([
        'user_id' => $userId,
        'contact_number' => $contactNumber,
        'city' => $city,
        'province' => $province,
        'barangay' => $barangay,
        'country' => $country,
    ]);

    $pdo->commit();

    respond(201, [
        'ok' => true,
        'message' => 'Account created successfully.',
        'data' => [
            'id' => $userId,
            'email' => $email,
            'username' => $username,
        ],
    ]);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    respond(500, [
        'ok' => false,
        'message' => 'Unable to create account.',
        'error' => $exception->getMessage(),
    ]);
}
