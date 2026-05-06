<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

run_api(
    static function (PDO $pdo, array $payload): array {
        return save_initial_assessment($pdo, $payload);
    },
    'Initial assessment saved successfully.',
    201,
    ['POST']
);
