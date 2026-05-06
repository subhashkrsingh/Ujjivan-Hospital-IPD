<?php
declare(strict_types=1);

function validate_required_fields(array $payload, array $fields): void
{
    $errors = [];

    foreach ($fields as $field => $label) {
        $value = $payload[$field] ?? null;
        if (is_array($value)) {
            if ($value === []) {
                $errors[$field] = sprintf('%s is required.', $label);
            }
            continue;
        }

        if (normalize_string($value) === null) {
            $errors[$field] = sprintf('%s is required.', $label);
        }
    }

    if ($errors !== []) {
        throw new InvalidArgumentException(json_encode($errors, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: 'Validation failed.');
    }
}

function decode_validation_exception(InvalidArgumentException $exception): array
{
    $decoded = json_decode($exception->getMessage(), true);
    return is_array($decoded) ? $decoded : [];
}
