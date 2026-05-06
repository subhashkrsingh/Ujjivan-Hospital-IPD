<?php
declare(strict_types=1);

function normalize_string($value, int $maxLength = 0): ?string
{
    if ($value === null) {
        return null;
    }

    if (is_array($value) || is_object($value)) {
        return null;
    }

    $string = trim((string) $value);
    if ($string === '') {
        return null;
    }

    if ($maxLength > 0) {
        $string = mb_substr($string, 0, $maxLength);
    }

    return $string;
}

function normalize_phone($value): ?string
{
    $string = normalize_string($value, 20);
    if ($string === null) {
        return null;
    }

    return preg_replace('/[^0-9+]/', '', $string) ?: null;
}

function boolean_to_int($value): int
{
    if (is_bool($value)) {
        return $value ? 1 : 0;
    }

    $normalized = strtolower((string) $value);

    return in_array($normalized, ['1', 'true', 'yes', 'y', 'on', 'known'], true) ? 1 : 0;
}

function normalize_datetime($value, ?string $fallback = null): ?string
{
    $string = normalize_string($value);

    if ($string === null) {
        return $fallback;
    }

    $timestamp = strtotime($string);
    if ($timestamp === false) {
        throw new InvalidArgumentException(sprintf('Invalid datetime value: %s', $string));
    }

    return date('Y-m-d H:i:s', $timestamp);
}

function normalize_date($value, ?string $fallback = null): ?string
{
    $string = normalize_string($value);

    if ($string === null) {
        return $fallback;
    }

    $timestamp = strtotime($string);
    if ($timestamp === false) {
        throw new InvalidArgumentException(sprintf('Invalid date value: %s', $string));
    }

    return date('Y-m-d', $timestamp);
}

function generate_reference(string $prefix): string
{
    return sprintf('%s-%s%s', $prefix, date('YmdHis'), random_int(100, 999));
}

function split_full_name(?string $fullName): array
{
    $fullName = normalize_string($fullName, 200);
    if ($fullName === null) {
        return ['Unknown', null, null, 'Unknown'];
    }

    $parts = preg_split('/\s+/', $fullName);
    $parts = array_values(array_filter($parts, static fn ($part) => $part !== ''));

    if ($parts === []) {
        return ['Unknown', null, null, 'Unknown'];
    }

    $firstName = $parts[0];
    $lastName = count($parts) > 1 ? array_pop($parts) : null;
    $middleName = count($parts) > 1 ? trim(implode(' ', array_slice($parts, 1))) : null;

    return [$firstName, $middleName ?: null, $lastName, $fullName];
}

function parse_age_sex(?string $value): array
{
    $value = normalize_string($value, 50);
    if ($value === null) {
        return [null, 'unknown'];
    }

    $parts = preg_split('/[\/, -]+/', strtoupper($value));
    $age = null;
    $gender = 'unknown';

    foreach ($parts as $part) {
        if (ctype_digit($part)) {
            $age = (int) $part;
            continue;
        }

        if (in_array($part, ['M', 'MALE'], true)) {
            $gender = 'male';
        } elseif (in_array($part, ['F', 'FEMALE'], true)) {
            $gender = 'female';
        } elseif (in_array($part, ['O', 'OTHER'], true)) {
            $gender = 'other';
        }
    }

    return [$age, $gender];
}

function map_gender($value, string $default = 'unknown'): string
{
    $normalized = strtolower((string) $value);

    if (in_array($normalized, ['m', 'male'], true)) {
        return 'male';
    }

    if (in_array($normalized, ['f', 'female'], true)) {
        return 'female';
    }

    if (in_array($normalized, ['o', 'other'], true)) {
        return 'other';
    }

    return $default;
}

function parse_blood_pressure(?string $value): array
{
    $value = normalize_string($value, 20);

    if ($value === null) {
        return [null, null];
    }

    if (preg_match('/^\s*(\d{2,3})\s*\/\s*(\d{2,3})\s*$/', $value, $matches) === 1) {
        return [(int) $matches[1], (int) $matches[2]];
    }

    return [null, null];
}

function to_nullable_int($value): ?int
{
    $normalized = normalize_string($value);
    if ($normalized === null) {
        return null;
    }

    if (!is_numeric($normalized)) {
        throw new InvalidArgumentException(sprintf('Expected numeric value, received %s', $normalized));
    }

    return (int) $normalized;
}

function to_nullable_decimal($value, int $scale = 2): ?string
{
    $normalized = normalize_string($value);
    if ($normalized === null) {
        return null;
    }

    if (!is_numeric($normalized)) {
        throw new InvalidArgumentException(sprintf('Expected decimal value, received %s', $normalized));
    }

    return number_format((float) $normalized, $scale, '.', '');
}

function json_encode_safe($value): string
{
    return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '[]';
}
