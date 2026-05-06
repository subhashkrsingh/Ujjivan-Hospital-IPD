<?php
declare(strict_types=1);

require_once __DIR__ . '/env.php';

load_env_file(dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env');

function get_app_config(): array
{
    $allowedOrigins = env_value('ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://localhost,http://127.0.0.1');
    $origins = array_values(array_filter(array_map('trim', explode(',', (string) $allowedOrigins))));

    return [
        'app_env' => env_value('APP_ENV', 'development'),
        'app_debug' => env_value('APP_DEBUG', 'false') === 'true',
        'app_url' => env_value('APP_URL', 'http://localhost/ipd-backend'),
        'allowed_origins' => $origins,
        'session_name' => env_value('SESSION_NAME', 'hospital_ipd_session'),
    ];
}

function get_database_connection(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = env_value('DB_HOST', '127.0.0.1');
    $port = env_value('DB_PORT', '3306');
    $database = env_value('DB_NAME', 'hospital_ipd');
    $username = env_value('DB_USER', 'root');
    $password = env_value('DB_PASS', '');

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $database);

    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
