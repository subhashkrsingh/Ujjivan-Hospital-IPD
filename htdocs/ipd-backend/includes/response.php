<?php
declare(strict_types=1);

function json_response(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function success_response($data = null, string $message = 'Request completed successfully.', int $statusCode = 200): void
{
    json_response($statusCode, [
        'success' => true,
        'message' => $message,
        'data' => $data,
    ]);
}

function error_response(string $message, int $statusCode = 400, array $errors = [], $debug = null): void
{
    $payload = [
        'success' => false,
        'message' => $message,
        'errors' => $errors,
    ];

    if ($debug !== null) {
        $payload['debug'] = $debug;
    }

    json_response($statusCode, $payload);
}
