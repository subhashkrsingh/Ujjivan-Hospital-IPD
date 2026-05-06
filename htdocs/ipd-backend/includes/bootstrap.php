<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/common.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/request.php';
require_once __DIR__ . '/validator.php';
require_once __DIR__ . '/audit_service.php';
require_once __DIR__ . '/patient_service.php';
require_once __DIR__ . '/admission_service.php';
require_once __DIR__ . '/clinical_service.php';
require_once __DIR__ . '/billing_service.php';
require_once __DIR__ . '/auth_service.php';

function bootstrap_api(): array
{
    $config = get_app_config();
    apply_cors_headers($config['allowed_origins']);
    handle_preflight_request();

    return $config;
}

function run_api(callable $handler, string $successMessage, int $successStatus = 200, $methods = ['POST']): void
{
    $config = bootstrap_api();
    require_http_method($methods);

    try {
        $payload = get_request_payload();
        $data = $handler(get_database_connection(), $payload, $config);
        success_response($data, $successMessage, $successStatus);
    } catch (InvalidArgumentException $exception) {
        $errors = decode_validation_exception($exception);
        error_response($errors !== [] ? 'Validation failed.' : $exception->getMessage(), 422, $errors);
    } catch (PDOException $exception) {
        error_log($exception->getMessage());
        error_response(
            'Database operation failed.',
            500,
            [],
            $config['app_debug'] ? $exception->getMessage() : null
        );
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        error_response(
            'Unexpected server error.',
            500,
            [],
            $config['app_debug'] ? $exception->getMessage() : null
        );
    }
}
