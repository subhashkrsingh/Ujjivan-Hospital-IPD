<?php
declare(strict_types=1);

function build_patient_duplicate_guard_key(?string $fullName, ?int $ageYears, ?string $gender, ?string $mobile, ?string $dateOfBirth): ?string
{
    $segments = [
        strtolower((string) normalize_string($fullName, 200)),
        (string) ($ageYears ?? ''),
        strtolower((string) $gender),
        (string) normalize_phone($mobile),
        (string) normalize_date($dateOfBirth),
    ];

    $usableSegments = array_filter($segments, static fn ($segment) => $segment !== '');
    if (count($usableSegments) < 3) {
        return null;
    }

    return hash('sha256', implode('|', $segments));
}

function find_patient_by_identifiers(PDO $pdo, array $payload): ?array
{
    $candidateCodes = array_values(array_filter(array_unique([
        normalize_string($payload['patient_code'] ?? null, 50),
        normalize_string($payload['uhid'] ?? null, 50),
        normalize_string($payload['patientId'] ?? null, 50),
        normalize_string($payload['caseNumber'] ?? null, 50),
        normalize_string($payload['registrationNo'] ?? null, 50),
        normalize_string($payload['unid'] ?? null, 50),
    ])));

    if ($candidateCodes !== []) {
        $placeholders = implode(',', array_fill(0, count($candidateCodes), '?'));
        $statement = $pdo->prepare("SELECT * FROM patients WHERE deleted_at IS NULL AND patient_code IN ($placeholders) LIMIT 1");
        $statement->execute($candidateCodes);
        $patient = $statement->fetch();
        if (is_array($patient)) {
            return $patient;
        }
    }

    $mobile = normalize_phone(
        $payload['mobile'] ?? $payload['mobile_primary'] ?? $payload['witnessMobile'] ?? $payload['witness_mobile'] ?? $payload['accompaniedContact'] ?? null
    );
    $fullName = normalize_string(
        $payload['patientName'] ?? $payload['patient_name1'] ?? $payload['full_name'] ?? null,
        200
    );

    if ($mobile !== null && $fullName !== null) {
        $statement = $pdo->prepare(
            'SELECT * FROM patients
             WHERE deleted_at IS NULL
               AND mobile_primary = :mobile_primary
               AND full_name = :full_name
             LIMIT 1'
        );
        $statement->execute([
            ':mobile_primary' => $mobile,
            ':full_name' => $fullName,
        ]);
        $patient = $statement->fetch();
        if (is_array($patient)) {
            return $patient;
        }
    }

    return null;
}

function upsert_patient_address(PDO $pdo, int $patientId, ?string $addressLine1): void
{
    $addressLine1 = normalize_string($addressLine1, 255);
    if ($addressLine1 === null) {
        return;
    }

    $statement = $pdo->prepare(
        'SELECT id FROM patient_addresses
         WHERE patient_id = :patient_id
           AND address_type = :address_type
           AND deleted_at IS NULL
         ORDER BY id ASC
         LIMIT 1'
    );
    $statement->execute([
        ':patient_id' => $patientId,
        ':address_type' => 'home',
    ]);

    $existing = $statement->fetch();

    if (is_array($existing)) {
        $update = $pdo->prepare(
            'UPDATE patient_addresses
             SET address_line_1 = :address_line_1,
                 is_primary = 1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        );
        $update->execute([
            ':address_line_1' => $addressLine1,
            ':id' => $existing['id'],
        ]);
        return;
    }

    $insert = $pdo->prepare(
        'INSERT INTO patient_addresses (
            patient_id, address_type, address_line_1, is_primary
         ) VALUES (
            :patient_id, :address_type, :address_line_1, :is_primary
         )'
    );
    $insert->execute([
        ':patient_id' => $patientId,
        ':address_type' => 'home',
        ':address_line_1' => $addressLine1,
        ':is_primary' => 1,
    ]);
}

function create_patient_record(PDO $pdo, array $payload, array $overrides = []): array
{
    $patientCode = $overrides['patient_code']
        ?? normalize_string($payload['patient_code'] ?? $payload['uhid'] ?? $payload['patientId'] ?? $payload['caseNumber'] ?? $payload['registrationNo'] ?? $payload['unid'] ?? null, 50)
        ?? generate_reference('UHID');

    $fullName = $overrides['full_name']
        ?? normalize_string($payload['patientName'] ?? $payload['patient_name1'] ?? $payload['full_name'] ?? null, 200)
        ?? normalize_string($payload['relative_name'] ?? $payload['name'] ?? null, 200)
        ?? sprintf('Patient %s', $patientCode);

    [$firstName, $middleName, $lastName] = split_full_name($fullName);

    $gender = $overrides['gender'] ?? map_gender($payload['gender'] ?? $payload['sex'] ?? null, 'unknown');
    [$ageFromAgeSex, $genderFromAgeSex] = parse_age_sex($payload['ageSex'] ?? null);
    $ageYears = to_nullable_int($payload['age'] ?? $payload['age_years'] ?? $ageFromAgeSex);

    if ($gender === 'unknown' && $genderFromAgeSex !== 'unknown') {
        $gender = $genderFromAgeSex;
    }

    $mobile = normalize_phone(
        $payload['mobile'] ?? $payload['mobile_primary'] ?? $payload['witnessMobile'] ?? $payload['witness_mobile'] ?? $payload['accompaniedContact'] ?? null
    );
    $dateOfBirth = normalize_date($payload['date_of_birth'] ?? null);
    $duplicateGuardKey = build_patient_duplicate_guard_key($fullName, $ageYears, $gender, $mobile, $dateOfBirth);

    $statement = $pdo->prepare(
        'INSERT INTO patients (
            patient_code, first_name, middle_name, last_name, full_name, date_of_birth, age_years, gender,
            mobile_primary, email, emergency_contact_name, emergency_contact_relation, emergency_contact_phone,
            patient_type, duplicate_guard_key, status
         ) VALUES (
            :patient_code, :first_name, :middle_name, :last_name, :full_name, :date_of_birth, :age_years, :gender,
            :mobile_primary, :email, :emergency_contact_name, :emergency_contact_relation, :emergency_contact_phone,
            :patient_type, :duplicate_guard_key, :status
         )'
    );

    $statement->execute([
        ':patient_code' => $patientCode,
        ':first_name' => $firstName,
        ':middle_name' => $middleName,
        ':last_name' => $lastName,
        ':full_name' => $fullName,
        ':date_of_birth' => $dateOfBirth,
        ':age_years' => $ageYears,
        ':gender' => $gender,
        ':mobile_primary' => $mobile,
        ':email' => normalize_string($payload['email'] ?? null, 150),
        ':emergency_contact_name' => normalize_string($payload['relative_name'] ?? $payload['relative'] ?? $payload['accompaniedName'] ?? $payload['witnessName'] ?? null, 150),
        ':emergency_contact_relation' => normalize_string($payload['relation'] ?? $payload['relationship'] ?? $payload['witnessRelation'] ?? $payload['accompaniedRelation'] ?? null, 100),
        ':emergency_contact_phone' => normalize_phone($payload['witnessMobile'] ?? $payload['mobile'] ?? $payload['accompaniedContact'] ?? null),
        ':patient_type' => normalize_string($payload['patient_type'] ?? null, 20) ?? 'general',
        ':duplicate_guard_key' => $duplicateGuardKey,
        ':status' => 'active',
    ]);

    $patientId = (int) $pdo->lastInsertId();
    upsert_patient_address($pdo, $patientId, normalize_string($payload['address'] ?? $payload['full_address'] ?? $payload['witness_address'] ?? null, 255));

    $select = $pdo->prepare('SELECT * FROM patients WHERE id = :id LIMIT 1');
    $select->execute([':id' => $patientId]);

    return $select->fetch() ?: [];
}

function update_existing_patient(PDO $pdo, array $existingPatient, array $payload): array
{
    $fullName = normalize_string($payload['patientName'] ?? $payload['patient_name1'] ?? $existingPatient['full_name'], 200) ?? $existingPatient['full_name'];
    [$firstName, $middleName, $lastName] = split_full_name($fullName);

    [$ageFromAgeSex, $genderFromAgeSex] = parse_age_sex($payload['ageSex'] ?? null);
    $ageYears = to_nullable_int($payload['age'] ?? $payload['age_years'] ?? $ageFromAgeSex ?? $existingPatient['age_years']);
    $gender = map_gender($payload['gender'] ?? $payload['sex'] ?? $genderFromAgeSex ?? $existingPatient['gender'], $existingPatient['gender']);
    $mobile = normalize_phone($payload['mobile'] ?? $payload['mobile_primary'] ?? $existingPatient['mobile_primary']) ?? $existingPatient['mobile_primary'];

    $duplicateGuardKey = build_patient_duplicate_guard_key(
        $fullName,
        $ageYears,
        $gender,
        $mobile,
        normalize_date($payload['date_of_birth'] ?? $existingPatient['date_of_birth'])
    );

    $statement = $pdo->prepare(
        'UPDATE patients
         SET first_name = :first_name,
             middle_name = :middle_name,
             last_name = :last_name,
             full_name = :full_name,
             age_years = :age_years,
             gender = :gender,
             mobile_primary = :mobile_primary,
             emergency_contact_name = COALESCE(:emergency_contact_name, emergency_contact_name),
             emergency_contact_relation = COALESCE(:emergency_contact_relation, emergency_contact_relation),
             emergency_contact_phone = COALESCE(:emergency_contact_phone, emergency_contact_phone),
             duplicate_guard_key = COALESCE(:duplicate_guard_key, duplicate_guard_key),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :id'
    );

    $statement->execute([
        ':first_name' => $firstName,
        ':middle_name' => $middleName,
        ':last_name' => $lastName,
        ':full_name' => $fullName,
        ':age_years' => $ageYears,
        ':gender' => $gender,
        ':mobile_primary' => $mobile,
        ':emergency_contact_name' => normalize_string($payload['relative_name'] ?? $payload['relative'] ?? $payload['accompaniedName'] ?? $payload['witnessName'] ?? null, 150),
        ':emergency_contact_relation' => normalize_string($payload['relation'] ?? $payload['relationship'] ?? $payload['witnessRelation'] ?? $payload['accompaniedRelation'] ?? null, 100),
        ':emergency_contact_phone' => normalize_phone($payload['witnessMobile'] ?? $payload['mobile'] ?? $payload['accompaniedContact'] ?? null),
        ':duplicate_guard_key' => $duplicateGuardKey,
        ':id' => $existingPatient['id'],
    ]);

    upsert_patient_address($pdo, (int) $existingPatient['id'], normalize_string($payload['address'] ?? $payload['full_address'] ?? $payload['witness_address'] ?? null, 255));

    $select = $pdo->prepare('SELECT * FROM patients WHERE id = :id LIMIT 1');
    $select->execute([':id' => $existingPatient['id']]);

    return $select->fetch() ?: $existingPatient;
}

function ensure_patient_from_payload(PDO $pdo, array $payload, array $overrides = []): array
{
    $existingPatient = find_patient_by_identifiers($pdo, $payload);

    if (is_array($existingPatient)) {
        return update_existing_patient($pdo, $existingPatient, $payload);
    }

    return create_patient_record($pdo, $payload, $overrides);
}

function register_patient_from_payload(PDO $pdo, array $payload): array
{
    validate_required_fields($payload, [
        'full_name' => 'Patient name',
        'gender' => 'Gender',
    ]);

    $patient = ensure_patient_from_payload($pdo, [
        'patient_code' => $payload['patient_code'] ?? null,
        'full_name' => $payload['full_name'],
        'gender' => $payload['gender'],
        'age' => $payload['age'] ?? null,
        'date_of_birth' => $payload['date_of_birth'] ?? null,
        'mobile_primary' => $payload['mobile_primary'] ?? null,
        'email' => $payload['email'] ?? null,
        'relative_name' => $payload['emergency_contact_name'] ?? null,
        'relationship' => $payload['emergency_contact_relation'] ?? null,
        'witnessMobile' => $payload['emergency_contact_phone'] ?? null,
        'address' => $payload['address'] ?? null,
        'patient_type' => $payload['patient_type'] ?? 'general',
    ]);

    write_audit_log($pdo, null, 'patients', (int) $patient['id'], 'register_patient', $patient);

    return [
        'patient_id' => (int) $patient['id'],
        'patient_code' => $patient['patient_code'],
        'full_name' => $patient['full_name'],
    ];
}
