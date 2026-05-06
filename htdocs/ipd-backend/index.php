<?php
declare(strict_types=1);

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/response.php';
require_once __DIR__ . '/includes/request.php';

$config = get_app_config();
apply_cors_headers($config['allowed_origins']);
handle_preflight_request();

success_response([
    'name' => 'Hospital IPD PHP Backend',
    'status' => 'ok',
    'app_env' => $config['app_env'],
    'base_url' => $config['app_url'],
    'api_base' => rtrim($config['app_url'], '/') . '/api',
    'available_endpoints' => [
        'POST /api/login.php',
        'POST /api/patients/register.php',
        'POST /api/admissions/create.php',
        'POST /api/admissions/discharge.php',
        'POST /api/vitals/create.php',
        'POST /api/nursing-assessments/create.php',
        'POST /api/billing/create.php',
        'POST /api/consents/serious-patient.php',
        'POST /api/consents/hindi-consent.php',
        'POST /api/doctor-notes/progress.php',
        'POST /api/doctor-notes/consultant.php',
        'POST /api/doctor-notes/initial-assessment.php',
    ],
], 'Backend ready.');
