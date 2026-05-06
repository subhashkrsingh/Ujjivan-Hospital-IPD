<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

run_api(
    static function (PDO $pdo, array $payload): array {
        return save_english_consent($pdo, $payload);
    },
    'Consent form saved successfully.',
    201,
    ['POST']
);
