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
$gender = requiredString($payload, 'gender');
$email = strtolower(requiredString($payload, 'email'));
$contactNumber = requiredString($payload, 'contactNumber');
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

$birthDateObject = DateTimeImmutable::createFromFormat('!Y-m-d', $birthDate);
$birthDateErrors = DateTimeImmutable::getLastErrors();

if (
    !$birthDateObject ||
    ($birthDateErrors !== false && ($birthDateErrors['warning_count'] > 0 || $birthDateErrors['error_count'] > 0)) ||
    $birthDateObject->format('Y-m-d') !== $birthDate
) {
    respond(422, [
        'ok' => false,
        'message' => 'Enter a valid birth date.',
    ]);
}

$today = new DateTimeImmutable('today');
$age = $birthDateObject->diff($today)->y;

if ($birthDateObject > $today || $age < 1) {
    respond(422, [
        'ok' => false,
        'message' => 'You must be at least 1 year old.',
    ]);
}

$allowedGenders = ['male', 'female', 'bisexual', 'gay', 'lesbian', 'prefer_not_to_say'];

if (!in_array($gender, $allowedGenders, true)) {
    respond(422, [
        'ok' => false,
        'message' => 'Select a valid gender.',
    ]);
}

if ($middleInitial !== '' && !preg_match('/^[A-Za-z]$/', $middleInitial)) {
    respond(422, [
        'ok' => false,
        'message' => 'Middle initial must be one letter.',
    ]);
}

if ($extensionName !== '' && !preg_match('/^[A-Za-z.]{1,3}$/', $extensionName)) {
    respond(422, [
        'ok' => false,
        'message' => 'Extension name must be at most 3 letters or periods.',
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
            gender
        ) VALUES (
            :user_id,
            :first_name,
            :middle_initial,
            :last_name,
            :extension_name,
            :birth_date,
            :gender
        )'
    );
    $statement->execute([
        'user_id' => $userId,
        'first_name' => $firstName,
        'middle_initial' => $middleInitial !== '' ? $middleInitial : null,
        'last_name' => $lastName,
        'extension_name' => $extensionName !== '' ? $extensionName : null,
        'birth_date' => $birthDate,
        'gender' => $gender,
    ]);

    $statement = $pdo->prepare(
        'INSERT INTO user_contact_information (
            user_id,
            contact_number,
            country
        ) VALUES (
            :user_id,
            :contact_number,
            :country
        )'
    );
    $statement->execute([
        'user_id' => $userId,
        'contact_number' => $contactNumber,
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
