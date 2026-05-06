<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

run_api(
    static function (PDO $pdo, array $payload): array {
        return create_billing_record($pdo, $payload);
    },
    'Billing record created successfully.',
    201,
    ['POST']
);
