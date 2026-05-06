<?php
declare(strict_types=1);

function ensure_default_bed_context(PDO $pdo): array
{
    $wardStatement = $pdo->prepare('SELECT * FROM wards WHERE ward_code = :ward_code LIMIT 1');
    $wardStatement->execute([':ward_code' => 'WARD-GEN']);
    $ward = $wardStatement->fetch();

    if (!is_array($ward)) {
        $insertWard = $pdo->prepare(
            'INSERT INTO wards (ward_code, ward_name, ward_type, floor_label, gender_restriction, status)
             VALUES (:ward_code, :ward_name, :ward_type, :floor_label, :gender_restriction, :status)'
        );
        $insertWard->execute([
            ':ward_code' => 'WARD-GEN',
            ':ward_name' => 'General Ward',
            ':ward_type' => 'general',
            ':floor_label' => 'Ground Floor',
            ':gender_restriction' => 'mixed',
            ':status' => 'active',
        ]);

        $ward = ['id' => (int) $pdo->lastInsertId(), 'ward_code' => 'WARD-GEN'];
    }

    $roomStatement = $pdo->prepare('SELECT * FROM rooms WHERE room_code = :room_code LIMIT 1');
    $roomStatement->execute([':room_code' => 'ROOM-GEN-01']);
    $room = $roomStatement->fetch();

    if (!is_array($room)) {
        $insertRoom = $pdo->prepare(
            'INSERT INTO rooms (ward_id, room_code, room_number, room_type, status)
             VALUES (:ward_id, :room_code, :room_number, :room_type, :status)'
        );
        $insertRoom->execute([
            ':ward_id' => $ward['id'],
            ':room_code' => 'ROOM-GEN-01',
            ':room_number' => 'G-101',
            ':room_type' => 'shared',
            ':status' => 'active',
        ]);

        $room = ['id' => (int) $pdo->lastInsertId(), 'ward_id' => $ward['id']];
    }

    return [
        'ward_id' => (int) $ward['id'],
        'room_id' => (int) $room['id'],
    ];
}

function resolve_bed_from_reference(PDO $pdo, ?string $bedReference): ?array
{
    $bedReference = normalize_string($bedReference, 50);
    if ($bedReference === null) {
        return null;
    }

    $statement = $pdo->prepare(
        'SELECT beds.*, rooms.ward_id
         FROM beds
         INNER JOIN rooms ON rooms.id = beds.room_id
         WHERE beds.deleted_at IS NULL
           AND (
               beds.bed_code = :reference_code
               OR beds.bed_number = :reference_number
               OR beds.bed_label = :reference_label
           )
         LIMIT 1'
    );
    $statement->execute([
        ':reference_code' => $bedReference,
        ':reference_number' => $bedReference,
        ':reference_label' => $bedReference,
    ]);

    $bed = $statement->fetch();
    if (is_array($bed)) {
        return $bed;
    }

    $context = ensure_default_bed_context($pdo);
    $insert = $pdo->prepare(
        'INSERT INTO beds (room_id, bed_code, bed_number, bed_label, bed_type, daily_rate, status)
         VALUES (:room_id, :bed_code, :bed_number, :bed_label, :bed_type, :daily_rate, :status)'
    );
    $bedCode = 'BED-' . preg_replace('/[^A-Z0-9]+/i', '-', strtoupper($bedReference));
    $insert->execute([
        ':room_id' => $context['room_id'],
        ':bed_code' => $bedCode,
        ':bed_number' => $bedReference,
        ':bed_label' => 'Auto-created bed ' . $bedReference,
        ':bed_type' => 'standard',
        ':daily_rate' => '0.00',
        ':status' => 'available',
    ]);

    $select = $pdo->prepare(
        'SELECT beds.*, rooms.ward_id
         FROM beds
         INNER JOIN rooms ON rooms.id = beds.room_id
         WHERE beds.id = :id
         LIMIT 1'
    );
    $select->execute([':id' => (int) $pdo->lastInsertId()]);

    return $select->fetch() ?: null;
}

function find_admission_by_identifiers(PDO $pdo, array $payload, ?int $patientId = null): ?array
{
    $candidateAdmissionNumbers = array_values(array_filter(array_unique([
        normalize_string($payload['admission_no'] ?? null, 50),
        normalize_string($payload['admissionNo'] ?? null, 50),
        normalize_string($payload['registrationNo'] ?? null, 50),
    ])));

    $candidateIpdNumbers = array_values(array_filter(array_unique([
        normalize_string($payload['ipd'] ?? null, 50),
        normalize_string($payload['ipdNumber'] ?? null, 50),
        normalize_string($payload['wardNumber'] ?? null, 50),
    ])));

    foreach ($candidateAdmissionNumbers as $admissionNumber) {
        $statement = $pdo->prepare('SELECT * FROM admissions WHERE deleted_at IS NULL AND admission_no = :admission_no LIMIT 1');
        $statement->execute([':admission_no' => $admissionNumber]);
        $admission = $statement->fetch();
        if (is_array($admission)) {
            return $admission;
        }
    }

    foreach ($candidateIpdNumbers as $ipdNumber) {
        $statement = $pdo->prepare('SELECT * FROM admissions WHERE deleted_at IS NULL AND ipd_number = :ipd_number LIMIT 1');
        $statement->execute([':ipd_number' => $ipdNumber]);
        $admission = $statement->fetch();
        if (is_array($admission)) {
            return $admission;
        }
    }

    if ($patientId !== null) {
        $statement = $pdo->prepare(
            "SELECT * FROM admissions
             WHERE deleted_at IS NULL
               AND patient_id = :patient_id
               AND admission_status IN ('planned', 'admitted', 'transferred')
             ORDER BY admitted_at DESC
             LIMIT 1"
        );
        $statement->execute([':patient_id' => $patientId]);
        $admission = $statement->fetch();
        if (is_array($admission)) {
            return $admission;
        }
    }

    return null;
}

function assign_bed_to_admission(PDO $pdo, array $admission, array $bed): void
{
    $statement = $pdo->prepare(
        "SELECT id FROM bed_allocations
         WHERE admission_id = :admission_id
           AND bed_id = :bed_id
           AND allocation_status = 'active'
           AND allocated_to IS NULL
         LIMIT 1"
    );
    $statement->execute([
        ':admission_id' => $admission['id'],
        ':bed_id' => $bed['id'],
    ]);

    if ($statement->fetch()) {
        return;
    }

    $insert = $pdo->prepare(
        'INSERT INTO bed_allocations (
            admission_id, bed_id, ward_id, room_id, allocated_from, allocation_status, reason
         ) VALUES (
            :admission_id, :bed_id, :ward_id, :room_id, :allocated_from, :allocation_status, :reason
         )'
    );
    $insert->execute([
        ':admission_id' => $admission['id'],
        ':bed_id' => $bed['id'],
        ':ward_id' => $bed['ward_id'],
        ':room_id' => $bed['room_id'],
        ':allocated_from' => $admission['admitted_at'],
        ':allocation_status' => 'active',
        ':reason' => 'Assigned through API submission',
    ]);

    $updateBed = $pdo->prepare('UPDATE beds SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
    $updateBed->execute([
        ':status' => 'occupied',
        ':id' => $bed['id'],
    ]);
}

function create_or_update_admission_from_payload(PDO $pdo, array $payload, array $patient, ?int $doctorId = null): array
{
    $existingAdmission = find_admission_by_identifiers($pdo, $payload, (int) $patient['id']);
    $bed = resolve_bed_from_reference($pdo, normalize_string($payload['bedNo'] ?? $payload['patientId'] ?? null, 50));
    $admittedAt = normalize_datetime($payload['admissionDate'] ?? $payload['doa'] ?? $payload['dateTime'] ?? null, date('Y-m-d H:i:s'));

    if (is_array($existingAdmission)) {
        $update = $pdo->prepare(
            'UPDATE admissions
             SET doctor_id = COALESCE(:doctor_id, doctor_id),
                 ward_id = COALESCE(:ward_id, ward_id),
                 room_id = COALESCE(:room_id, room_id),
                 bed_id = COALESCE(:bed_id, bed_id),
                 admission_reason = COALESCE(:admission_reason, admission_reason),
                 diagnosis_summary = COALESCE(:diagnosis_summary, diagnosis_summary),
                 attendant_name = COALESCE(:attendant_name, attendant_name),
                 attendant_relation = COALESCE(:attendant_relation, attendant_relation),
                 attendant_mobile = COALESCE(:attendant_mobile, attendant_mobile),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        );
        $update->execute([
            ':doctor_id' => $doctorId,
            ':ward_id' => $bed['ward_id'] ?? null,
            ':room_id' => $bed['room_id'] ?? null,
            ':bed_id' => $bed['id'] ?? null,
            ':admission_reason' => normalize_string($payload['presentIllness'] ?? null),
            ':diagnosis_summary' => normalize_string($payload['diagnosis'] ?? null, 65535),
            ':attendant_name' => normalize_string($payload['relative_name'] ?? $payload['accompaniedName'] ?? $payload['attendantName'] ?? null, 150),
            ':attendant_relation' => normalize_string($payload['relation'] ?? $payload['relationship'] ?? $payload['accompaniedRelation'] ?? null, 100),
            ':attendant_mobile' => normalize_phone($payload['mobile'] ?? $payload['accompaniedContact'] ?? null),
            ':id' => $existingAdmission['id'],
        ]);

        if (is_array($bed)) {
            assign_bed_to_admission($pdo, array_merge($existingAdmission, ['admitted_at' => $existingAdmission['admitted_at'] ?: $admittedAt]), $bed);
        }

        $select = $pdo->prepare('SELECT * FROM admissions WHERE id = :id LIMIT 1');
        $select->execute([':id' => $existingAdmission['id']]);
        return $select->fetch() ?: $existingAdmission;
    }

    $admissionNo = normalize_string($payload['admission_no'] ?? $payload['admissionNo'] ?? $payload['registrationNo'] ?? null, 50) ?? generate_reference('ADM');
    $ipdNumber = normalize_string($payload['ipd'] ?? $payload['ipdNumber'] ?? $payload['wardNumber'] ?? null, 50) ?? generate_reference('IPD');

    $insert = $pdo->prepare(
        'INSERT INTO admissions (
            patient_id, admission_no, ipd_number, doctor_id, ward_id, room_id, bed_id, admission_source,
            admission_reason, diagnosis_summary, admission_status, attendant_name, attendant_relation,
            attendant_mobile, admitted_at
         ) VALUES (
            :patient_id, :admission_no, :ipd_number, :doctor_id, :ward_id, :room_id, :bed_id, :admission_source,
            :admission_reason, :diagnosis_summary, :admission_status, :attendant_name, :attendant_relation,
            :attendant_mobile, :admitted_at
         )'
    );
    $insert->execute([
        ':patient_id' => $patient['id'],
        ':admission_no' => $admissionNo,
        ':ipd_number' => $ipdNumber,
        ':doctor_id' => $doctorId,
        ':ward_id' => $bed['ward_id'] ?? null,
        ':room_id' => $bed['room_id'] ?? null,
        ':bed_id' => $bed['id'] ?? null,
        ':admission_source' => normalize_string($payload['admission_source'] ?? null, 20) ?? 'other',
        ':admission_reason' => normalize_string($payload['presentIllness'] ?? null),
        ':diagnosis_summary' => normalize_string($payload['diagnosis'] ?? null),
        ':admission_status' => 'admitted',
        ':attendant_name' => normalize_string($payload['relative_name'] ?? $payload['accompaniedName'] ?? $payload['attendantName'] ?? null, 150),
        ':attendant_relation' => normalize_string($payload['relation'] ?? $payload['relationship'] ?? $payload['accompaniedRelation'] ?? null, 100),
        ':attendant_mobile' => normalize_phone($payload['mobile'] ?? $payload['accompaniedContact'] ?? null),
        ':admitted_at' => $admittedAt,
    ]);

    $admissionId = (int) $pdo->lastInsertId();
    $select = $pdo->prepare('SELECT * FROM admissions WHERE id = :id LIMIT 1');
    $select->execute([':id' => $admissionId]);
    $admission = $select->fetch() ?: [];

    if (is_array($bed)) {
        assign_bed_to_admission($pdo, $admission, $bed);
    }

    $updatePatient = $pdo->prepare('UPDATE patients SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
    $updatePatient->execute([
        ':status' => 'admitted',
        ':id' => $patient['id'],
    ]);

    return $admission;
}

function create_or_update_discharge_from_payload(PDO $pdo, array $payload, array $admission, ?int $doctorId = null, ?int $nurseId = null): array
{
    $dischargedAt = normalize_datetime($payload['dischargeDate'] ?? $payload['orderDatetime'] ?? null, date('Y-m-d H:i:s'));

    $statement = $pdo->prepare('SELECT * FROM discharges WHERE admission_id = :admission_id LIMIT 1');
    $statement->execute([':admission_id' => $admission['id']]);
    $existingDischarge = $statement->fetch();

    if (is_array($existingDischarge)) {
        $update = $pdo->prepare(
            'UPDATE discharges
             SET doctor_id = COALESCE(:doctor_id, doctor_id),
                 nurse_id = COALESCE(:nurse_id, nurse_id),
                 discharge_summary = COALESCE(:discharge_summary, discharge_summary),
                 final_diagnosis = COALESCE(:final_diagnosis, final_diagnosis),
                 attendant_name = COALESCE(:attendant_name, attendant_name),
                 attendant_relation = COALESCE(:attendant_relation, attendant_relation),
                 attendant_mobile = COALESCE(:attendant_mobile, attendant_mobile),
                 discharged_at = :discharged_at,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        );
        $update->execute([
            ':doctor_id' => $doctorId,
            ':nurse_id' => $nurseId,
            ':discharge_summary' => normalize_string($payload['dischargeSummary'] ?? null),
            ':final_diagnosis' => normalize_string($payload['diagnosis'] ?? null),
            ':attendant_name' => normalize_string($payload['relative_name'] ?? $payload['attendantName'] ?? null, 150),
            ':attendant_relation' => normalize_string($payload['relationship'] ?? null, 100),
            ':attendant_mobile' => normalize_phone($payload['mobile'] ?? null),
            ':discharged_at' => $dischargedAt,
            ':id' => $existingDischarge['id'],
        ]);

        $dischargeId = (int) $existingDischarge['id'];
    } else {
        $insert = $pdo->prepare(
            'INSERT INTO discharges (
                admission_id, discharge_no, doctor_id, nurse_id, discharge_type, discharge_status,
                final_diagnosis, discharge_summary, attendant_name, attendant_relation, attendant_mobile, discharged_at
             ) VALUES (
                :admission_id, :discharge_no, :doctor_id, :nurse_id, :discharge_type, :discharge_status,
                :final_diagnosis, :discharge_summary, :attendant_name, :attendant_relation, :attendant_mobile, :discharged_at
             )'
        );
        $insert->execute([
            ':admission_id' => $admission['id'],
            ':discharge_no' => generate_reference('DIS'),
            ':doctor_id' => $doctorId,
            ':nurse_id' => $nurseId,
            ':discharge_type' => normalize_string($payload['discharge_type'] ?? null, 20) ?? 'regular',
            ':discharge_status' => 'completed',
            ':final_diagnosis' => normalize_string($payload['diagnosis'] ?? null),
            ':discharge_summary' => normalize_string($payload['dischargeSummary'] ?? null),
            ':attendant_name' => normalize_string($payload['relative_name'] ?? $payload['attendantName'] ?? null, 150),
            ':attendant_relation' => normalize_string($payload['relationship'] ?? null, 100),
            ':attendant_mobile' => normalize_phone($payload['mobile'] ?? null),
            ':discharged_at' => $dischargedAt,
        ]);
        $dischargeId = (int) $pdo->lastInsertId();
    }

    $updateAdmission = $pdo->prepare(
        'UPDATE admissions
         SET admission_status = :admission_status,
             discharged_at = :discharged_at,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = :id'
    );
    $updateAdmission->execute([
        ':admission_status' => 'discharged',
        ':discharged_at' => $dischargedAt,
        ':id' => $admission['id'],
    ]);

    $releaseBeds = $pdo->prepare(
        "UPDATE bed_allocations
         SET allocated_to = :allocated_to,
             allocation_status = 'released',
             updated_at = CURRENT_TIMESTAMP
         WHERE admission_id = :admission_id
           AND allocation_status = 'active'
           AND allocated_to IS NULL"
    );
    $releaseBeds->execute([
        ':allocated_to' => $dischargedAt,
        ':admission_id' => $admission['id'],
    ]);

    if (!empty($admission['bed_id'])) {
        $updateBed = $pdo->prepare('UPDATE beds SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
        $updateBed->execute([
            ':status' => 'available',
            ':id' => $admission['bed_id'],
        ]);
    }

    $updatePatient = $pdo->prepare('UPDATE patients SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id');
    $updatePatient->execute([
        ':status' => 'discharged',
        ':id' => $admission['patient_id'],
    ]);

    $select = $pdo->prepare('SELECT * FROM discharges WHERE id = :id LIMIT 1');
    $select->execute([':id' => $dischargeId]);

    return $select->fetch() ?: [];
}

function save_bed_ticket(PDO $pdo, array $payload): array
{
    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, $payload, [
            'patient_code' => normalize_string($payload['registrationNo'] ?? null, 50) ?? generate_reference('UHID'),
            'full_name' => normalize_string($payload['patientName'] ?? null, 200) ?? 'Unknown Patient',
        ]);

        $doctor = resolve_doctor_from_name(
            $pdo,
            normalize_string($payload['doctorName'] ?? null, 150),
            null,
            normalize_string($payload['doctorDepartment'] ?? null, 150)
        );

        $admission = create_or_update_admission_from_payload($pdo, $payload, $patient, $doctor['id'] ?? null);
        $discharge = null;

        if (normalize_string($payload['dischargeDate'] ?? null) !== null) {
            $discharge = create_or_update_discharge_from_payload($pdo, $payload, $admission, $doctor['id'] ?? null, null);
        }

        write_audit_log($pdo, null, 'admissions', (int) $admission['id'], 'save_bed_ticket', [
            'patient_id' => (int) $patient['id'],
            'admission_id' => (int) $admission['id'],
            'discharge_id' => $discharge['id'] ?? null,
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'patient_code' => $patient['patient_code'],
            'admission_id' => (int) $admission['id'],
            'admission_no' => $admission['admission_no'],
            'ipd_number' => $admission['ipd_number'],
            'discharge_id' => $discharge['id'] ?? null,
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}

function discharge_patient_from_payload(PDO $pdo, array $payload): array
{
    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, $payload);
        $admission = find_admission_by_identifiers($pdo, $payload, (int) $patient['id']);

        if (!is_array($admission)) {
            throw new InvalidArgumentException('No admission record found for the supplied identifiers.');
        }

        $doctor = resolve_doctor_from_name($pdo, normalize_string($payload['doctorName'] ?? null, 150), null, null);
        $nurse = resolve_nurse_from_name($pdo, normalize_string($payload['nurseName'] ?? null, 150));
        $discharge = create_or_update_discharge_from_payload($pdo, $payload, $admission, $doctor['id'] ?? null, $nurse['id'] ?? null);

        write_audit_log($pdo, null, 'discharges', (int) $discharge['id'], 'discharge_patient', [
            'patient_id' => (int) $patient['id'],
            'admission_id' => (int) $admission['id'],
            'discharge_id' => (int) $discharge['id'],
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'admission_id' => (int) $admission['id'],
            'discharge_id' => (int) $discharge['id'],
            'discharge_no' => $discharge['discharge_no'],
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}
