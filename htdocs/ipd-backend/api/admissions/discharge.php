<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

run_api(
    static function (PDO $pdo, array $payload): array {
        return discharge_patient_from_payload($pdo, $payload);
    },
    'Discharge saved successfully.',
    200,
    ['POST']
);
