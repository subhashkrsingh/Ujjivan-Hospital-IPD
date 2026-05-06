<?php
declare(strict_types=1);

function authenticate_user(PDO $pdo, array $payload, array $config): array
{
    validate_required_fields($payload, [
        'username' => 'Username',
        'password' => 'Password',
    ]);

    $username = normalize_string($payload['username'], 80);
    $statement = $pdo->prepare(
        'SELECT users.*, roles.name AS role_name
         FROM users
         INNER JOIN roles ON roles.id = users.role_id
         WHERE users.deleted_at IS NULL
           AND (users.username = :username OR users.email = :email)
         LIMIT 1'
    );
    $statement->execute([
        ':username' => $username,
        ':email' => $username,
    ]);

    $user = $statement->fetch();
    if (!is_array($user) || !password_verify((string) $payload['password'], $user['password_hash'])) {
        throw new InvalidArgumentException('Invalid username or password.');
    }

    if ($user['status'] !== 'active') {
        throw new InvalidArgumentException('User account is not active.');
    }

    session_name($config['session_name']);
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    $_SESSION['authenticated_user'] = [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'role' => $user['role_name'],
        'full_name' => $user['full_name'],
    ];

    $update = $pdo->prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
    $update->execute([':id' => $user['id']]);

    write_audit_log($pdo, (int) $user['id'], 'users', (int) $user['id'], 'login', [
        'username' => $user['username'],
        'role' => $user['role_name'],
    ]);

    return [
        'user' => [
            'id' => (int) $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'full_name' => $user['full_name'],
            'role' => $user['role_name'],
        ],
        'session_id' => session_id(),
    ];
}
