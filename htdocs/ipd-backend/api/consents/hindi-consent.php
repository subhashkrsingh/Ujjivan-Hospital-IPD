<?php
declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

run_api(
    static function (PDO $pdo, array $payload): array {
        return save_hindi_consent($pdo, $payload);
    },
    'Hindi consent form saved successfully.',
    201,
    ['POST']
);
