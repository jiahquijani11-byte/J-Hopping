<?php

function authRespond(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'message' => $message]);
    exit;
}

function bearerToken(): string
{
    $authorization = trim((string) ($_SERVER['HTTP_AUTHORIZATION'] ?? ''));

    if ($authorization === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $authorization = trim((string) $value);
                break;
            }
        }
    }

    if (!preg_match('/^Bearer\s+(.+)$/i', $authorization, $matches)) {
        authRespond(401, 'Authentication is required.');
    }

    return trim($matches[1]);
}

function requireAuthenticatedUser(PDO $pdo, ?string $requiredRole = null): array
{
    $tokenHash = hash('sha256', bearerToken());
    $statement = $pdo->prepare(
        'SELECT
            auth_sessions.id AS session_id,
            users.id AS user_id,
            users.role
         FROM auth_sessions
         INNER JOIN users ON users.id = auth_sessions.user_id
         WHERE auth_sessions.token_hash = :token_hash
           AND auth_sessions.expires_at > NOW()
         LIMIT 1'
    );
    $statement->execute(['token_hash' => $tokenHash]);
    $authenticated = $statement->fetch();

    if (!$authenticated) {
        authRespond(401, 'Your session is invalid or has expired. Please sign in again.');
    }

    if ($requiredRole !== null && $authenticated['role'] !== $requiredRole) {
        authRespond(403, 'You do not have permission to access this resource.');
    }

    $statement = $pdo->prepare(
        'UPDATE auth_sessions SET last_used_at = CURRENT_TIMESTAMP WHERE id = :session_id'
    );
    $statement->execute(['session_id' => $authenticated['session_id']]);

    return $authenticated;
}
