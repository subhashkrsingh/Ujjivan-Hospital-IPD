<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/bootstrap.php';

run_api(
    static function (PDO $pdo, array $payload, array $config): array {
        return authenticate_user($pdo, $payload, $config);
    },
    'Login successful.',
    200,
    ['POST']
);
