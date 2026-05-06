<?php
declare(strict_types=1);

function request_origin(): ?string
{
    return $_SERVER['HTTP_ORIGIN'] ?? null;
}

function request_path(): string
{
    return $_SERVER['REQUEST_URI'] ?? '';
}

function client_ip_address(): ?string
{
    return $_SERVER['REMOTE_ADDR'] ?? null;
}

function request_user_agent(): ?string
{
    return $_SERVER['HTTP_USER_AGENT'] ?? null;
}

function apply_cors_headers(array $allowedOrigins): void
{
    $origin = request_origin();
    if ($origin !== null && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        header('Access-Control-Allow-Origin: http://localhost:5173');
    }

    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

function handle_preflight_request(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
        success_response(null, 'Preflight OK', 200);
    }
}

function require_http_method($methods): void
{
    $methods = is_array($methods) ? $methods : [$methods];
    $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if (!in_array($requestMethod, $methods, true)) {
        error_response('Method not allowed.', 405);
    }
}

function get_request_payload(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'application/json') !== false) {
        $rawBody = file_get_contents('php://input');
        if ($rawBody === false || trim($rawBody) === '') {
            return [];
        }

        $decoded = json_decode($rawBody, true);
        if (!is_array($decoded)) {
            throw new InvalidArgumentException('Invalid JSON payload.');
        }

        return $decoded;
    }

    if (!empty($_POST)) {
        return $_POST;
    }

    $rawBody = file_get_contents('php://input');
    if ($rawBody === false || trim($rawBody) === '') {
        return [];
    }

    parse_str($rawBody, $parsed);

    return is_array($parsed) ? $parsed : [];
}
