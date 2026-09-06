<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

function managerSelect(): string
{
    return 'SELECT
                destination_managers.id,
                destination_managers.user_id,
                destination_managers.business_name,
                destination_managers.first_name,
                destination_managers.middle_name,
                destination_managers.last_name,
                destination_managers.extension_name,
                destination_managers.contact_number,
                destination_managers.status,
                destination_managers.created_at,
                destination_managers.updated_at,
                users.email,
                users.username
            FROM destination_managers
            INNER JOIN users ON users.id = destination_managers.user_id';
}

function managerData(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'userId' => (int) $row['user_id'],
        'businessName' => $row['business_name'],
        'firstName' => $row['first_name'],
        'middleName' => $row['middle_name'],
        'lastName' => $row['last_name'],
        'extensionName' => $row['extension_name'],
        'email' => $row['email'],
        'contactNumber' => $row['contact_number'],
        'username' => $row['username'],
        'status' => $row['status'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}

function validatedFields(array $payload): array
{
    $email = strtolower(requiredString($payload, 'email'));

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(422, ['ok' => false, 'message' => 'Enter a valid email address.']);
    }

    $status = strtolower(trim((string) ($payload['status'] ?? 'active')));

    if (!in_array($status, ['active', 'pending', 'suspended'], true)) {
        respond(422, ['ok' => false, 'message' => 'Select a valid account status.']);
    }

    return [
        'business_name' => requiredString($payload, 'businessName'),
        'first_name' => requiredString($payload, 'firstName'),
        'middle_name' => trim((string) ($payload['middleName'] ?? '')) ?: null,
        'last_name' => requiredString($payload, 'lastName'),
        'extension_name' => trim((string) ($payload['extensionName'] ?? '')) ?: null,
        'email' => $email,
        'contact_number' => requiredString($payload, 'contactNumber'),
        'username' => requiredString($payload, 'username'),
        'status' => $status,
    ];
}

try {
    $pdo = getDatabaseConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

    if ($method === 'GET') {
        if ($id) {
            $statement = $pdo->prepare(managerSelect() . ' WHERE destination_managers.id = :id LIMIT 1');
            $statement->execute(['id' => $id]);
            $manager = $statement->fetch();

            if (!$manager) {
                respond(404, ['ok' => false, 'message' => 'Destination manager not found.']);
            }

            respond(200, ['ok' => true, 'data' => managerData($manager)]);
        }

        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = (int) ($_GET['per_page'] ?? 5);
        $allowedPerPage = [5, 10, 20, 30];

        if (!in_array($perPage, $allowedPerPage, true)) {
            $perPage = 5;
        }

        $search = trim((string) ($_GET['search'] ?? ''));
        $status = trim((string) ($_GET['status'] ?? ''));
        $where = [];
        $values = [];

        if ($status !== '') {
            if (!in_array($status, ['active', 'pending', 'suspended'], true)) {
                respond(422, ['ok' => false, 'message' => 'Select a valid manager status.']);
            }

            $where[] = 'destination_managers.status = :status';
            $values['status'] = $status;
        }

        if ($search !== '') {
            $where[] = "CONCAT_WS(' ',
                destination_managers.business_name,
                destination_managers.first_name,
                destination_managers.middle_name,
                destination_managers.last_name,
                destination_managers.extension_name,
                users.email,
                users.username
            ) LIKE :search";
            $values['search'] = '%' . $search . '%';
        }

        $whereSql = $where ? ' WHERE ' . implode(' AND ', $where) : '';
        $countStatement = $pdo->prepare(
            'SELECT COUNT(*) FROM destination_managers
             INNER JOIN users ON users.id = destination_managers.user_id' . $whereSql
        );
        $countStatement->execute($values);
        $total = (int) $countStatement->fetchColumn();
        $totalPages = max(1, (int) ceil($total / $perPage));
        $page = min($page, $totalPages);
        $offset = ($page - 1) * $perPage;

        $pendingStatement = $pdo->query(
            "SELECT COUNT(*) FROM destination_managers WHERE status = 'pending'"
        );
        $pendingCount = (int) $pendingStatement->fetchColumn();

        $statement = $pdo->prepare(
            managerSelect() . $whereSql .
            ' ORDER BY destination_managers.created_at DESC LIMIT :limit OFFSET :offset'
        );

        foreach ($values as $key => $value) {
            $statement->bindValue(':' . $key, $value);
        }

        $statement->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $statement->bindValue(':offset', $offset, PDO::PARAM_INT);
        $statement->execute();
        $managers = array_map('managerData', $statement->fetchAll());

        respond(200, [
            'ok' => true,
            'data' => $managers,
            'meta' => [
                'page' => $page,
                'perPage' => $perPage,
                'pendingCount' => $pendingCount,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
        ]);
    }

    if ($method === 'POST') {
        $payload = requestPayload();
        $fields = validatedFields($payload);
        $password = (string) ($payload['password'] ?? '');
        validatePassword($password);

        $pdo->beginTransaction();
        $statement = $pdo->prepare(
            'INSERT INTO users (email, username, role, password_hash)
             VALUES (:email, :username, :role, :password_hash)'
        );
        $statement->execute([
            'email' => $fields['email'],
            'username' => $fields['username'],
            'role' => 'manager',
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        $userId = (int) $pdo->lastInsertId();
        $statement = $pdo->prepare(
            'INSERT INTO destination_managers (
                user_id, business_name, first_name, middle_name, last_name,
                extension_name, contact_number, status
             ) VALUES (
                :user_id, :business_name, :first_name, :middle_name, :last_name,
                :extension_name, :contact_number, :status
             )'
        );
        $statement->execute([
            'user_id' => $userId,
            'business_name' => $fields['business_name'],
            'first_name' => $fields['first_name'],
            'middle_name' => $fields['middle_name'],
            'last_name' => $fields['last_name'],
            'extension_name' => $fields['extension_name'],
            'contact_number' => $fields['contact_number'],
            'status' => $fields['status'],
        ]);
        $managerId = (int) $pdo->lastInsertId();
        $pdo->commit();

        $statement = $pdo->prepare(managerSelect() . ' WHERE destination_managers.id = :id LIMIT 1');
        $statement->execute(['id' => $managerId]);
        respond(201, [
            'ok' => true,
            'message' => 'Destination manager created successfully.',
            'data' => managerData($statement->fetch()),
        ]);
    }

    if ($method === 'PUT') {
        if (!$id) {
            respond(422, ['ok' => false, 'message' => 'Destination manager ID is required.']);
        }

        $payload = requestPayload();
        $fields = validatedFields($payload);
        $password = (string) ($payload['password'] ?? '');

        if ($password !== '') {
            validatePassword($password);
        }

        $statement = $pdo->prepare('SELECT user_id FROM destination_managers WHERE id = :id LIMIT 1');
        $statement->execute(['id' => $id]);
        $manager = $statement->fetch();

        if (!$manager) {
            respond(404, ['ok' => false, 'message' => 'Destination manager not found.']);
        }

        $pdo->beginTransaction();
        $userSql = 'UPDATE users SET email = :email, username = :username';
        $userValues = [
            'email' => $fields['email'],
            'username' => $fields['username'],
            'user_id' => $manager['user_id'],
        ];

        if ($password !== '') {
            $userSql .= ', password_hash = :password_hash';
            $userValues['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        }

        $userSql .= ' WHERE id = :user_id';
        $statement = $pdo->prepare($userSql);
        $statement->execute($userValues);

        $statement = $pdo->prepare(
            'UPDATE destination_managers SET
                business_name = :business_name,
                first_name = :first_name,
                middle_name = :middle_name,
                last_name = :last_name,
                extension_name = :extension_name,
                contact_number = :contact_number,
                status = :status
             WHERE id = :id'
        );
        $statement->execute([
            'business_name' => $fields['business_name'],
            'first_name' => $fields['first_name'],
            'middle_name' => $fields['middle_name'],
            'last_name' => $fields['last_name'],
            'extension_name' => $fields['extension_name'],
            'contact_number' => $fields['contact_number'],
            'status' => $fields['status'],
            'id' => $id,
        ]);
        $pdo->commit();

        $statement = $pdo->prepare(managerSelect() . ' WHERE destination_managers.id = :id LIMIT 1');
        $statement->execute(['id' => $id]);
        respond(200, [
            'ok' => true,
            'message' => 'Destination manager updated successfully.',
            'data' => managerData($statement->fetch()),
        ]);
    }

    if ($method === 'DELETE') {
        if (!$id) {
            respond(422, ['ok' => false, 'message' => 'Destination manager ID is required.']);
        }

        $statement = $pdo->prepare('SELECT user_id FROM destination_managers WHERE id = :id LIMIT 1');
        $statement->execute(['id' => $id]);
        $manager = $statement->fetch();

        if (!$manager) {
            respond(404, ['ok' => false, 'message' => 'Destination manager not found.']);
        }

        $statement = $pdo->prepare('DELETE FROM users WHERE id = :user_id');
        $statement->execute(['user_id' => $manager['user_id']]);
        respond(200, ['ok' => true, 'message' => 'Destination manager deleted successfully.']);
    }

    respond(405, ['ok' => false, 'message' => 'Method not allowed.']);
} catch (PDOException $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    if ((string) $exception->getCode() === '23000') {
        respond(409, ['ok' => false, 'message' => 'That email address or username is already in use.']);
    }

    respond(500, ['ok' => false, 'message' => 'Unable to process the destination manager request.']);
} catch (Throwable $exception) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    respond(500, ['ok' => false, 'message' => 'Unable to process the destination manager request.']);
}
