<?php
declare(strict_types=1);

function resolve_doctor_from_name(PDO $pdo, ?string $doctorName, ?string $designation = null, ?string $department = null): ?array
{
    $doctorName = normalize_string($doctorName, 150);
    if ($doctorName === null) {
        return null;
    }

    $statement = $pdo->prepare('SELECT * FROM doctors WHERE deleted_at IS NULL AND full_name = :full_name LIMIT 1');
    $statement->execute([':full_name' => $doctorName]);
    $doctor = $statement->fetch();

    if (is_array($doctor)) {
        if ($department !== null || $designation !== null) {
            $update = $pdo->prepare(
                'UPDATE doctors
                 SET department = COALESCE(:department, department),
                     specialization = COALESCE(:specialization, specialization),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = :id'
            );
            $update->execute([
                ':department' => normalize_string($department, 150),
                ':specialization' => normalize_string($designation, 150),
                ':id' => $doctor['id'],
            ]);

            $select = $pdo->prepare('SELECT * FROM doctors WHERE id = :id LIMIT 1');
            $select->execute([':id' => $doctor['id']]);
            return $select->fetch() ?: $doctor;
        }

        return $doctor;
    }

    $insert = $pdo->prepare(
        'INSERT INTO doctors (
            doctor_code, full_name, department, specialization, status
         ) VALUES (
            :doctor_code, :full_name, :department, :specialization, :status
         )'
    );
    $insert->execute([
        ':doctor_code' => generate_reference('DOC'),
        ':full_name' => $doctorName,
        ':department' => normalize_string($department, 150),
        ':specialization' => normalize_string($designation, 150),
        ':status' => 'active',
    ]);

    $select = $pdo->prepare('SELECT * FROM doctors WHERE id = :id LIMIT 1');
    $select->execute([':id' => (int) $pdo->lastInsertId()]);

    return $select->fetch() ?: null;
}

function resolve_nurse_from_name(PDO $pdo, ?string $nurseName): ?array
{
    $nurseName = normalize_string($nurseName, 150);
    if ($nurseName === null) {
        return null;
    }

    $statement = $pdo->prepare('SELECT * FROM nurses WHERE deleted_at IS NULL AND full_name = :full_name LIMIT 1');
    $statement->execute([':full_name' => $nurseName]);
    $nurse = $statement->fetch();

    if (is_array($nurse)) {
        return $nurse;
    }

    $insert = $pdo->prepare(
        'INSERT INTO nurses (nurse_code, full_name, designation, status)
         VALUES (:nurse_code, :full_name, :designation, :status)'
    );
    $insert->execute([
        ':nurse_code' => generate_reference('NUR'),
        ':full_name' => $nurseName,
        ':designation' => 'Staff Nurse',
        ':status' => 'active',
    ]);

    $select = $pdo->prepare('SELECT * FROM nurses WHERE id = :id LIMIT 1');
    $select->execute([':id' => (int) $pdo->lastInsertId()]);

    return $select->fetch() ?: null;
}

function resolve_recorded_by_user_id(PDO $pdo, ?array $doctor = null, ?array $nurse = null): ?int
{
    if (is_array($nurse) && !empty($nurse['user_id'])) {
        return (int) $nurse['user_id'];
    }

    if (is_array($doctor) && !empty($doctor['user_id'])) {
        return (int) $doctor['user_id'];
    }

    return null;
}

function create_vital_record(PDO $pdo, array $payload, array $patient, ?array $admission, ?int $recordedByUserId, string $sourceForm): ?array
{
    [$systolic, $diastolic] = parse_blood_pressure($payload['bp'] ?? null);
    $pulse = to_nullable_int($payload['pulse'] ?? null);
    $respiration = to_nullable_int($payload['rr'] ?? $payload['respiration'] ?? null);
    $temperature = to_nullable_decimal($payload['temp'] ?? $payload['temperature'] ?? null, 1);
    $spo2 = to_nullable_decimal($payload['SPo2'] ?? $payload['spo2'] ?? $payload['spo2_percent'] ?? null, 2);
    $painScore = to_nullable_int($payload['painScore'] ?? null);

    if ($systolic === null && $diastolic === null && $pulse === null && $respiration === null && $temperature === null && $spo2 === null && $painScore === null) {
        return null;
    }

    $statement = $pdo->prepare(
        'INSERT INTO vitals (
            patient_id, admission_id, recorded_by_user_id, source_form, systolic_bp, diastolic_bp,
            pulse_bpm, respiration_rpm, temperature_c, spo2_percent, pain_score, notes, recorded_at
         ) VALUES (
            :patient_id, :admission_id, :recorded_by_user_id, :source_form, :systolic_bp, :diastolic_bp,
            :pulse_bpm, :respiration_rpm, :temperature_c, :spo2_percent, :pain_score, :notes, :recorded_at
         )'
    );
    $statement->execute([
        ':patient_id' => $patient['id'],
        ':admission_id' => $admission['id'] ?? null,
        ':recorded_by_user_id' => $recordedByUserId,
        ':source_form' => $sourceForm,
        ':systolic_bp' => $systolic,
        ':diastolic_bp' => $diastolic,
        ':pulse_bpm' => $pulse,
        ':respiration_rpm' => $respiration,
        ':temperature_c' => $temperature,
        ':spo2_percent' => $spo2,
        ':pain_score' => $painScore,
        ':notes' => normalize_string($payload['otherVital'] ?? $payload['otherExamination'] ?? null),
        ':recorded_at' => normalize_datetime($payload['dateTime'] ?? $payload['orderDatetime'] ?? $payload['assessmentDate'] ?? null, date('Y-m-d H:i:s')),
    ]);

    $vitalId = (int) $pdo->lastInsertId();
    $select = $pdo->prepare('SELECT * FROM vitals WHERE id = :id LIMIT 1');
    $select->execute([':id' => $vitalId]);

    return $select->fetch() ?: null;
}

function create_prescription_from_text(PDO $pdo, array $patient, ?array $admission, ?array $doctor, ?string $notes): ?array
{
    $notes = normalize_string($notes);
    if ($notes === null) {
        return null;
    }

    $statement = $pdo->prepare(
        'INSERT INTO prescriptions (
            patient_id, admission_id, doctor_id, prescription_no, prescribed_at, status, notes
         ) VALUES (
            :patient_id, :admission_id, :doctor_id, :prescription_no, :prescribed_at, :status, :notes
         )'
    );
    $statement->execute([
        ':patient_id' => $patient['id'],
        ':admission_id' => $admission['id'] ?? null,
        ':doctor_id' => $doctor['id'] ?? null,
        ':prescription_no' => generate_reference('RX'),
        ':prescribed_at' => date('Y-m-d H:i:s'),
        ':status' => 'active',
        ':notes' => $notes,
    ]);

    $prescriptionId = (int) $pdo->lastInsertId();
    $select = $pdo->prepare('SELECT * FROM prescriptions WHERE id = :id LIMIT 1');
    $select->execute([':id' => $prescriptionId]);

    return $select->fetch() ?: null;
}

function create_investigation_from_text(PDO $pdo, array $patient, ?array $admission, ?array $doctor, ?string $text): ?array
{
    $text = normalize_string($text);
    if ($text === null) {
        return null;
    }

    $statement = $pdo->prepare(
        'INSERT INTO investigations (
            patient_id, admission_id, doctor_id, investigation_type, investigation_name, order_notes, status, ordered_at
         ) VALUES (
            :patient_id, :admission_id, :doctor_id, :investigation_type, :investigation_name, :order_notes, :status, :ordered_at
         )'
    );
    $statement->execute([
        ':patient_id' => $patient['id'],
        ':admission_id' => $admission['id'] ?? null,
        ':doctor_id' => $doctor['id'] ?? null,
        ':investigation_type' => 'other',
        ':investigation_name' => 'Clinical Investigation Order',
        ':order_notes' => $text,
        ':status' => 'ordered',
        ':ordered_at' => date('Y-m-d H:i:s'),
    ]);

    $investigationId = (int) $pdo->lastInsertId();
    $select = $pdo->prepare('SELECT * FROM investigations WHERE id = :id LIMIT 1');
    $select->execute([':id' => $investigationId]);

    return $select->fetch() ?: null;
}

function create_diagnosis_from_text(PDO $pdo, array $patient, ?array $admission, ?array $doctor, ?string $text, string $type = 'provisional'): ?array
{
    $text = normalize_string($text);
    if ($text === null) {
        return null;
    }

    $statement = $pdo->prepare(
        'INSERT INTO diagnoses (
            patient_id, admission_id, doctor_id, diagnosis_type, diagnosis_text, is_primary, diagnosed_at
         ) VALUES (
            :patient_id, :admission_id, :doctor_id, :diagnosis_type, :diagnosis_text, :is_primary, :diagnosed_at
         )'
    );
    $statement->execute([
        ':patient_id' => $patient['id'],
        ':admission_id' => $admission['id'] ?? null,
        ':doctor_id' => $doctor['id'] ?? null,
        ':diagnosis_type' => $type,
        ':diagnosis_text' => $text,
        ':is_primary' => 1,
        ':diagnosed_at' => date('Y-m-d H:i:s'),
    ]);

    $diagnosisId = (int) $pdo->lastInsertId();
    $select = $pdo->prepare('SELECT * FROM diagnoses WHERE id = :id LIMIT 1');
    $select->execute([':id' => $diagnosisId]);

    return $select->fetch() ?: null;
}

function determine_braden_risk_from_total(int $total): ?string
{
    if ($total <= 0) {
        return null;
    }
    if ($total <= 11) {
        return 'Severe Risk';
    }
    if ($total <= 14) {
        return 'Moderate Risk';
    }
    if ($total <= 16) {
        return 'Mild Risk';
    }

    return 'Low Risk';
}

function determine_fall_risk_level(int $total): ?string
{
    if ($total <= 0) {
        return null;
    }
    if ($total > 45) {
        return 'high';
    }
    if ($total > 24) {
        return 'medium';
    }

    return 'low';
}

function save_progress_note(PDO $pdo, array $payload): array
{
    validate_required_fields($payload, [
        'patientName' => 'Patient name',
        'progressReport' => 'Progress report',
        'medicationOrders' => 'Medication orders',
        'doctorName' => 'Doctor name',
    ]);

    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, $payload, [
            'patient_code' => normalize_string($payload['caseNumber'] ?? null, 50)
                ?? normalize_string($payload['patientId'] ?? null, 50)
                ?? generate_reference('UHID'),
            'full_name' => normalize_string($payload['patientName'], 200),
        ]);

        $doctor = resolve_doctor_from_name(
            $pdo,
            normalize_string($payload['doctorName'], 150),
            normalize_string($payload['doctorDesignation'] ?? null, 150),
            normalize_string($payload['doctorDepartment'] ?? null, 150)
        );
        $admission = create_or_update_admission_from_payload($pdo, $payload, $patient, $doctor['id'] ?? null);

        $statement = $pdo->prepare(
            'INSERT INTO doctor_notes (
                patient_id, admission_id, doctor_id, note_type, subject, progress_report, medication_orders,
                diagnosis_text, orders_legible, note_datetime, extra_payload
             ) VALUES (
                :patient_id, :admission_id, :doctor_id, :note_type, :subject, :progress_report, :medication_orders,
                :diagnosis_text, :orders_legible, :note_datetime, :extra_payload
             )'
        );
        $statement->execute([
            ':patient_id' => $patient['id'],
            ':admission_id' => $admission['id'] ?? null,
            ':doctor_id' => $doctor['id'] ?? null,
            ':note_type' => 'progress',
            ':subject' => 'Doctor Progress Sheet',
            ':progress_report' => normalize_string($payload['progressReport']),
            ':medication_orders' => normalize_string($payload['medicationOrders']),
            ':diagnosis_text' => normalize_string($payload['diagnosis'] ?? null),
            ':orders_legible' => boolean_to_int($payload['ordersLegible'] ?? false),
            ':note_datetime' => normalize_datetime($payload['dateTime'] ?? null, date('Y-m-d H:i:s')),
            ':extra_payload' => json_encode_safe($payload),
        ]);
        $noteId = (int) $pdo->lastInsertId();

        $prescription = create_prescription_from_text($pdo, $patient, $admission, $doctor, normalize_string($payload['medicationOrders']));

        write_audit_log($pdo, resolve_recorded_by_user_id($pdo, $doctor, null), 'doctor_notes', $noteId, 'save_progress_note', [
            'patient_id' => $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'prescription_id' => $prescription['id'] ?? null,
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'doctor_note_id' => $noteId,
            'prescription_id' => $prescription['id'] ?? null,
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}

function save_consultant_note(PDO $pdo, array $payload): array
{
    validate_required_fields($payload, [
        'patientId' => 'Patient ID',
        'consultationDate' => 'Consultation date',
        'investigations' => 'Investigations',
        'treatment' => 'Treatment',
        'consultantName' => 'Consultant name',
    ]);

    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, [
            'patientId' => $payload['patientId'],
            'patientName' => $payload['patientName'] ?? sprintf('Patient %s', $payload['patientId']),
            'mobile' => $payload['mobile'] ?? null,
        ], [
            'patient_code' => normalize_string($payload['patientId'], 50),
            'full_name' => normalize_string($payload['patientName'] ?? null, 200) ?? sprintf('Patient %s', $payload['patientId']),
        ]);

        $doctor = resolve_doctor_from_name(
            $pdo,
            normalize_string($payload['consultantName'], 150),
            'Consultant',
            normalize_string($payload['department'] ?? null, 150)
        );
        $admission = create_or_update_admission_from_payload($pdo, $payload, $patient, $doctor['id'] ?? null);

        $statement = $pdo->prepare(
            'INSERT INTO doctor_notes (
                patient_id, admission_id, doctor_id, note_type, subject, investigations_text, treatment_text,
                figure_notes, orders_legible, note_datetime, extra_payload
             ) VALUES (
                :patient_id, :admission_id, :doctor_id, :note_type, :subject, :investigations_text, :treatment_text,
                :figure_notes, :orders_legible, :note_datetime, :extra_payload
             )'
        );
        $statement->execute([
            ':patient_id' => $patient['id'],
            ':admission_id' => $admission['id'] ?? null,
            ':doctor_id' => $doctor['id'] ?? null,
            ':note_type' => 'consultant',
            ':subject' => 'Consultant Note',
            ':investigations_text' => normalize_string($payload['investigations']),
            ':treatment_text' => normalize_string($payload['treatment']),
            ':figure_notes' => normalize_string($payload['figure'] ?? null),
            ':orders_legible' => boolean_to_int($payload['ordersLegible'] ?? false),
            ':note_datetime' => normalize_datetime($payload['consultationDate'] ?? null, date('Y-m-d H:i:s')),
            ':extra_payload' => json_encode_safe($payload),
        ]);
        $noteId = (int) $pdo->lastInsertId();

        $investigation = create_investigation_from_text($pdo, $patient, $admission, $doctor, normalize_string($payload['investigations']));
        $prescription = create_prescription_from_text($pdo, $patient, $admission, $doctor, normalize_string($payload['treatment']));

        write_audit_log($pdo, resolve_recorded_by_user_id($pdo, $doctor, null), 'doctor_notes', $noteId, 'save_consultant_note', [
            'patient_id' => $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'investigation_id' => $investigation['id'] ?? null,
            'prescription_id' => $prescription['id'] ?? null,
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'doctor_note_id' => $noteId,
            'investigation_id' => $investigation['id'] ?? null,
            'prescription_id' => $prescription['id'] ?? null,
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}

function save_initial_assessment(PDO $pdo, array $payload): array
{
    validate_required_fields($payload, [
        'patientName' => 'Patient name',
        'gender' => 'Gender',
        'diagnosis' => 'Diagnosis',
        'investigations' => 'Investigations',
        'treatment' => 'Treatment',
        'consultantName' => 'Consultant name',
    ]);

    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, [
            'unid' => $payload['unid'] ?? null,
            'patientName' => $payload['patientName'],
            'gender' => $payload['gender'],
            'age' => $payload['age'] ?? null,
            'mobile' => $payload['mobile'] ?? null,
        ], [
            'patient_code' => normalize_string($payload['unid'] ?? null, 50) ?? generate_reference('UHID'),
            'full_name' => normalize_string($payload['patientName'], 200),
        ]);

        $doctor = resolve_doctor_from_name(
            $pdo,
            normalize_string($payload['consultantName'], 150),
            'Consultant',
            null
        );
        $admission = create_or_update_admission_from_payload($pdo, $payload, $patient, $doctor['id'] ?? null);
        $vital = create_vital_record($pdo, $payload, $patient, $admission, resolve_recorded_by_user_id($pdo, $doctor, null), 'initial_assessment');

        $statement = $pdo->prepare(
            'INSERT INTO doctor_notes (
                patient_id, admission_id, doctor_id, note_type, subject, present_illness, investigations_text,
                treatment_text, system_evaluation, figure_notes, diagnosis_text, past_history_text, other_findings,
                orders_legible, note_datetime, extra_payload
             ) VALUES (
                :patient_id, :admission_id, :doctor_id, :note_type, :subject, :present_illness, :investigations_text,
                :treatment_text, :system_evaluation, :figure_notes, :diagnosis_text, :past_history_text, :other_findings,
                :orders_legible, :note_datetime, :extra_payload
             )'
        );
        $statement->execute([
            ':patient_id' => $patient['id'],
            ':admission_id' => $admission['id'] ?? null,
            ':doctor_id' => $doctor['id'] ?? null,
            ':note_type' => 'initial_assessment',
            ':subject' => 'Initial Assessment Sheet',
            ':present_illness' => normalize_string($payload['presentIllness'] ?? null),
            ':investigations_text' => normalize_string($payload['investigations']),
            ':treatment_text' => normalize_string($payload['treatment']),
            ':system_evaluation' => normalize_string($payload['systemEvaluation'] ?? null),
            ':figure_notes' => normalize_string($payload['figure'] ?? null),
            ':diagnosis_text' => normalize_string($payload['diagnosis']),
            ':past_history_text' => is_array($payload['pastHistory'] ?? null)
                ? implode(', ', $payload['pastHistory'])
                : normalize_string($payload['pastHistory'] ?? null),
            ':other_findings' => normalize_string($payload['otherExamination'] ?? null),
            ':orders_legible' => boolean_to_int($payload['ordersLegible'] ?? false),
            ':note_datetime' => date('Y-m-d H:i:s'),
            ':extra_payload' => json_encode_safe($payload),
        ]);
        $noteId = (int) $pdo->lastInsertId();

        $diagnosis = create_diagnosis_from_text($pdo, $patient, $admission, $doctor, normalize_string($payload['diagnosis']), 'provisional');
        $investigation = create_investigation_from_text($pdo, $patient, $admission, $doctor, normalize_string($payload['investigations']));
        $prescription = create_prescription_from_text($pdo, $patient, $admission, $doctor, normalize_string($payload['treatment']));

        write_audit_log($pdo, resolve_recorded_by_user_id($pdo, $doctor, null), 'doctor_notes', $noteId, 'save_initial_assessment', [
            'patient_id' => $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'vital_id' => $vital['id'] ?? null,
            'diagnosis_id' => $diagnosis['id'] ?? null,
            'investigation_id' => $investigation['id'] ?? null,
            'prescription_id' => $prescription['id'] ?? null,
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'doctor_note_id' => $noteId,
            'vital_id' => $vital['id'] ?? null,
            'diagnosis_id' => $diagnosis['id'] ?? null,
            'investigation_id' => $investigation['id'] ?? null,
            'prescription_id' => $prescription['id'] ?? null,
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}

function save_nursing_assessment(PDO $pdo, array $payload): array
{
    validate_required_fields($payload, [
        'patientName' => 'Patient name',
        'uhid' => 'UHID',
        'ipd' => 'IPD number',
        'bedNo' => 'Bed number',
        'assessmentDate' => 'Assessment date',
        'nurseName' => 'Nurse name',
    ]);

    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, [
            'uhid' => $payload['uhid'],
            'patientName' => $payload['patientName'],
            'ageSex' => $payload['ageSex'] ?? null,
            'mobile' => $payload['accompaniedContact'] ?? null,
        ], [
            'patient_code' => normalize_string($payload['uhid'], 50),
            'full_name' => normalize_string($payload['patientName'], 200),
        ]);

        $admission = create_or_update_admission_from_payload($pdo, [
            'ipd' => $payload['ipd'],
            'bedNo' => $payload['bedNo'],
            'doa' => $payload['doa'] ?? null,
            'patientName' => $payload['patientName'],
            'diagnosis' => $payload['diagnosis'] ?? null,
            'relation' => $payload['accompaniedRelation'] ?? null,
            'mobile' => $payload['accompaniedContact'] ?? null,
        ], $patient, null);

        $nurse = resolve_nurse_from_name($pdo, normalize_string($payload['nurseName'], 150));
        $vital = create_vital_record($pdo, [
            'temperature' => $payload['temperature'] ?? null,
            'pulse' => $payload['pulse'] ?? null,
            'respiration' => $payload['respiration'] ?? null,
            'SPo2' => $payload['SPo2'] ?? null,
            'painScore' => $payload['painScore'] ?? null,
            'otherVital' => $payload['otherVital'] ?? null,
            'orderDatetime' => $payload['orderDatetime'] ?? null,
        ], $patient, $admission, resolve_recorded_by_user_id($pdo, null, $nurse), 'nursing_initial');

        $orientationSummary = [
            'orientPatientConscious' => boolean_to_int($payload['orientPatientConscious'] ?? false),
            'orientAttendantUnconscious' => boolean_to_int($payload['orientAttendantUnconscious'] ?? false),
            'orientAttendantDisoriented' => boolean_to_int($payload['orientAttendantDisoriented'] ?? false),
        ];
        $facilitySummary = [
            'facilityRoom' => boolean_to_int($payload['facilityRoom'] ?? false),
            'facilityWashroom' => boolean_to_int($payload['facilityWashroom'] ?? false),
            'facilityVisiting' => boolean_to_int($payload['facilityVisiting'] ?? false),
            'facilityTV' => boolean_to_int($payload['facilityTV'] ?? false),
            'facilitySmoking' => boolean_to_int($payload['facilitySmoking'] ?? false),
            'facilityCrab' => boolean_to_int($payload['facilityCrab'] ?? false),
            'facilityExit' => boolean_to_int($payload['facilityExit'] ?? false),
            'facilityDietary' => boolean_to_int($payload['facilityDietary'] ?? false),
            'facilityGrievance' => boolean_to_int($payload['facilityGrievance'] ?? false),
            'facilityDoctor' => boolean_to_int($payload['facilityDoctor'] ?? false),
            'facilityRights' => boolean_to_int($payload['facilityRights'] ?? false),
        ];
        $bradenScores = is_array($payload['bradenScores'] ?? null) ? $payload['bradenScores'] : [];
        $bradenTotal = array_sum(array_map(static fn ($value) => (int) $value, $bradenScores));
        $fallRiskComponents = [
            'fallHistory' => (int) ($payload['fallHistory'] ?? 0),
            'secondaryDiagnosis' => (int) ($payload['secondaryDiagnosis'] ?? 0),
            'ambulatoryAid' => (int) ($payload['ambulatoryAid'] ?? 0),
            'ivHeparin' => (int) ($payload['ivHeparin'] ?? 0),
            'gait' => (int) ($payload['gait'] ?? 0),
            'mentalStatus' => (int) ($payload['mentalStatus'] ?? 0),
        ];
        $fallRiskTotal = array_sum($fallRiskComponents);

        $statement = $pdo->prepare(
            'INSERT INTO nursing_assessments (
                patient_id, admission_id, nurse_id, assessment_type, patient_accompanied, accompanied_name,
                accompanied_relation, accompanied_contact, primary_language, language_other, id_band_color,
                vulnerable, patient_status, psychological_status, temperature_c, pulse_bpm, respiration_rpm,
                spo2_percent, other_vital, pain_present, pain_score, pain_frequency, pain_type, pain_location,
                action_needed, orientation_summary, facilities_orientation, allergies_status, skin_check,
                iv_line_started, braden_scores, braden_total, braden_risk, fall_risk_components, fall_risk_total,
                fall_risk_level, assessment_date, order_datetime, notes
             ) VALUES (
                :patient_id, :admission_id, :nurse_id, :assessment_type, :patient_accompanied, :accompanied_name,
                :accompanied_relation, :accompanied_contact, :primary_language, :language_other, :id_band_color,
                :vulnerable, :patient_status, :psychological_status, :temperature_c, :pulse_bpm, :respiration_rpm,
                :spo2_percent, :other_vital, :pain_present, :pain_score, :pain_frequency, :pain_type, :pain_location,
                :action_needed, :orientation_summary, :facilities_orientation, :allergies_status, :skin_check,
                :iv_line_started, :braden_scores, :braden_total, :braden_risk, :fall_risk_components, :fall_risk_total,
                :fall_risk_level, :assessment_date, :order_datetime, :notes
             )'
        );
        $statement->execute([
            ':patient_id' => $patient['id'],
            ':admission_id' => $admission['id'] ?? null,
            ':nurse_id' => $nurse['id'] ?? null,
            ':assessment_type' => 'initial',
            ':patient_accompanied' => boolean_to_int($payload['patientAccompanied'] ?? false),
            ':accompanied_name' => normalize_string($payload['accompaniedName'] ?? null, 150),
            ':accompanied_relation' => normalize_string($payload['accompaniedRelation'] ?? null, 100),
            ':accompanied_contact' => normalize_phone($payload['accompaniedContact'] ?? null),
            ':primary_language' => normalize_string($payload['primaryLanguage'] ?? null, 50),
            ':language_other' => normalize_string($payload['languageOther'] ?? null, 100),
            ':id_band_color' => normalize_string($payload['idBandColor'] ?? null, 50),
            ':vulnerable' => boolean_to_int($payload['vulnerable'] ?? false),
            ':patient_status' => normalize_string($payload['patientStatus'] ?? null, 50),
            ':psychological_status' => normalize_string($payload['psychologicalStatus'] ?? null, 100),
            ':temperature_c' => to_nullable_decimal($payload['temperature'] ?? null, 1),
            ':pulse_bpm' => to_nullable_int($payload['pulse'] ?? null),
            ':respiration_rpm' => to_nullable_int($payload['respiration'] ?? null),
            ':spo2_percent' => to_nullable_decimal($payload['SPo2'] ?? null, 2),
            ':other_vital' => normalize_string($payload['otherVital'] ?? null, 100),
            ':pain_present' => boolean_to_int($payload['painPresent'] ?? false),
            ':pain_score' => to_nullable_int($payload['painScore'] ?? null),
            ':pain_frequency' => normalize_string($payload['painFrequency'] ?? null, 100),
            ':pain_type' => normalize_string($payload['painType'] ?? null, 100),
            ':pain_location' => normalize_string($payload['painLocation'] ?? null, 255),
            ':action_needed' => boolean_to_int($payload['painAction'] ?? false),
            ':orientation_summary' => json_encode_safe($orientationSummary),
            ':facilities_orientation' => json_encode_safe($facilitySummary),
            ':allergies_status' => normalize_string($payload['allergies'] ?? null, 20) ?? 'unknown',
            ':skin_check' => normalize_string($payload['skinCheck'] ?? null) === null ? null : boolean_to_int($payload['skinCheck']),
            ':iv_line_started' => normalize_string($payload['ivLine'] ?? null) === null ? null : boolean_to_int($payload['ivLine']),
            ':braden_scores' => json_encode_safe($bradenScores),
            ':braden_total' => $bradenTotal > 0 ? $bradenTotal : null,
            ':braden_risk' => determine_braden_risk_from_total($bradenTotal),
            ':fall_risk_components' => json_encode_safe($fallRiskComponents),
            ':fall_risk_total' => $fallRiskTotal > 0 ? $fallRiskTotal : null,
            ':fall_risk_level' => determine_fall_risk_level($fallRiskTotal),
            ':assessment_date' => normalize_date($payload['assessmentDate'] ?? null, date('Y-m-d')),
            ':order_datetime' => normalize_datetime($payload['orderDatetime'] ?? null),
            ':notes' => json_encode_safe($payload),
        ]);
        $assessmentId = (int) $pdo->lastInsertId();

        write_audit_log($pdo, resolve_recorded_by_user_id($pdo, null, $nurse), 'nursing_assessments', $assessmentId, 'save_nursing_assessment', [
            'patient_id' => $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'vital_id' => $vital['id'] ?? null,
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'nursing_assessment_id' => $assessmentId,
            'vital_id' => $vital['id'] ?? null,
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}

function save_english_consent(PDO $pdo, array $payload): array
{
    validate_required_fields($payload, [
        'patient_name1' => 'Patient name',
        'relative_name' => 'Relative name',
        'relation' => 'Relation',
    ]);

    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, [
            'patientName' => $payload['patient_name1'],
            'mobile' => $payload['mobile'] ?? null,
            'address' => $payload['full_address'] ?? $payload['address'] ?? null,
        ], [
            'patient_code' => generate_reference('UHID'),
            'full_name' => normalize_string($payload['patient_name1'], 200),
        ]);

        $statement = $pdo->prepare(
            'INSERT INTO consent_forms (
                patient_id, consent_type, patient_name_snapshot, relation_to_patient, signer_name, signer_age,
                signer_gender, signer_address, signer_mobile, signer_signature, relative_of, witness_name,
                witness_address, witness_mobile, witness_signature, consent_place, consent_time, witness_place,
                witness_time, consent_date, witness_date, payload
             ) VALUES (
                :patient_id, :consent_type, :patient_name_snapshot, :relation_to_patient, :signer_name, :signer_age,
                :signer_gender, :signer_address, :signer_mobile, :signer_signature, :relative_of, :witness_name,
                :witness_address, :witness_mobile, :witness_signature, :consent_place, :consent_time, :witness_place,
                :witness_time, :consent_date, :witness_date, :payload
             )'
        );
        $statement->execute([
            ':patient_id' => $patient['id'],
            ':consent_type' => 'serious_patient_english',
            ':patient_name_snapshot' => normalize_string($payload['patient_name1'], 150),
            ':relation_to_patient' => normalize_string($payload['relation'] ?? null, 100),
            ':signer_name' => normalize_string($payload['relative_name'] ?? null, 150),
            ':signer_age' => normalize_string($payload['age'] ?? null, 20),
            ':signer_gender' => normalize_string($payload['sex'] ?? null, 30),
            ':signer_address' => normalize_string($payload['full_address'] ?? $payload['address'] ?? null),
            ':signer_mobile' => normalize_phone($payload['mobile'] ?? null),
            ':signer_signature' => normalize_string($payload['relative_signature'] ?? null, 150),
            ':relative_of' => normalize_string($payload['relative_of'] ?? null, 150),
            ':witness_name' => normalize_string($payload['witness_name'] ?? null, 150),
            ':witness_address' => normalize_string($payload['witness_address'] ?? null),
            ':witness_mobile' => normalize_phone($payload['witness_mobile'] ?? null),
            ':witness_signature' => normalize_string($payload['witness_signature'] ?? null, 150),
            ':consent_place' => normalize_string($payload['place'] ?? null, 150),
            ':consent_time' => normalize_string($payload['time'] ?? null, 30),
            ':witness_place' => normalize_string($payload['witness_place'] ?? null, 150),
            ':witness_time' => normalize_string($payload['witness_time'] ?? null, 30),
            ':consent_date' => normalize_date($payload['date'] ?? null),
            ':witness_date' => normalize_date($payload['witness_date'] ?? null),
            ':payload' => json_encode_safe($payload),
        ]);
        $consentId = (int) $pdo->lastInsertId();

        write_audit_log($pdo, null, 'consent_forms', $consentId, 'save_english_consent', [
            'patient_id' => $patient['id'],
            'consent_id' => $consentId,
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'consent_id' => $consentId,
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}

function save_hindi_consent(PDO $pdo, array $payload): array
{
    validate_required_fields($payload, [
        'patientName' => 'Patient name',
        'relationship' => 'Relationship',
        'witnessName' => 'Witness name',
    ]);

    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, [
            'patientName' => $payload['patientName'],
            'mobile' => $payload['mobile'] ?? null,
            'address' => $payload['address'] ?? null,
            'gender' => $payload['gender'] ?? null,
            'age' => $payload['age'] ?? null,
        ], [
            'patient_code' => generate_reference('UHID'),
            'full_name' => normalize_string($payload['patientName'], 200),
        ]);

        $statement = $pdo->prepare(
            'INSERT INTO consent_forms (
                patient_id, consent_type, patient_name_snapshot, relation_to_patient, signer_name, signer_age,
                signer_gender, signer_address, signer_mobile, relative_of, witness_name, witness_relation,
                witness_mobile, consent_place, consent_time, witness_place, witness_time, consent_date,
                witness_date, payload
             ) VALUES (
                :patient_id, :consent_type, :patient_name_snapshot, :relation_to_patient, :signer_name, :signer_age,
                :signer_gender, :signer_address, :signer_mobile, :relative_of, :witness_name, :witness_relation,
                :witness_mobile, :consent_place, :consent_time, :witness_place, :witness_time, :consent_date,
                :witness_date, :payload
             )'
        );
        $statement->execute([
            ':patient_id' => $patient['id'],
            ':consent_type' => 'serious_patient_hindi',
            ':patient_name_snapshot' => normalize_string($payload['patientName'], 150),
            ':relation_to_patient' => normalize_string($payload['relationship'] ?? null, 100),
            ':signer_name' => normalize_string($payload['name'] ?? null, 150),
            ':signer_age' => normalize_string($payload['age'] ?? null, 20),
            ':signer_gender' => normalize_string($payload['gender'] ?? null, 30),
            ':signer_address' => normalize_string($payload['address'] ?? null),
            ':signer_mobile' => normalize_phone($payload['mobile'] ?? null),
            ':relative_of' => normalize_string($payload['relative'] ?? null, 150),
            ':witness_name' => normalize_string($payload['witnessName'] ?? null, 150),
            ':witness_relation' => normalize_string($payload['witnessRelation'] ?? null, 100),
            ':witness_mobile' => normalize_phone($payload['witnessMobile'] ?? null),
            ':consent_place' => normalize_string($payload['location'] ?? null, 150),
            ':consent_time' => normalize_string($payload['time'] ?? null, 30),
            ':witness_place' => normalize_string($payload['witnessLocation'] ?? null, 150),
            ':witness_time' => normalize_string($payload['witnessTime'] ?? null, 30),
            ':consent_date' => normalize_date($payload['signatureDate'] ?? null),
            ':witness_date' => normalize_date($payload['witnessDate'] ?? null),
            ':payload' => json_encode_safe($payload),
        ]);
        $consentId = (int) $pdo->lastInsertId();

        write_audit_log($pdo, null, 'consent_forms', $consentId, 'save_hindi_consent', [
            'patient_id' => $patient['id'],
            'consent_id' => $consentId,
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'consent_id' => $consentId,
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}

function save_standalone_vitals(PDO $pdo, array $payload): array
{
    validate_required_fields($payload, [
        'patient_code' => 'Patient code',
    ]);

    $pdo->beginTransaction();

    try {
        $patient = ensure_patient_from_payload($pdo, [
            'patientId' => $payload['patient_code'],
            'patientName' => $payload['patient_name'] ?? sprintf('Patient %s', $payload['patient_code']),
        ], [
            'patient_code' => normalize_string($payload['patient_code'], 50),
            'full_name' => normalize_string($payload['patient_name'] ?? null, 200) ?? sprintf('Patient %s', $payload['patient_code']),
        ]);
        $admission = find_admission_by_identifiers($pdo, $payload, (int) $patient['id']);
        $vital = create_vital_record($pdo, $payload, $patient, $admission, null, 'manual');

        if (!is_array($vital)) {
            throw new InvalidArgumentException('At least one vital sign is required.');
        }

        write_audit_log($pdo, null, 'vitals', (int) $vital['id'], 'save_standalone_vitals', [
            'patient_id' => $patient['id'],
            'admission_id' => $admission['id'] ?? null,
        ]);

        $pdo->commit();

        return [
            'patient_id' => (int) $patient['id'],
            'admission_id' => $admission['id'] ?? null,
            'vital_id' => (int) $vital['id'],
        ];
    } catch (Throwable $exception) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $exception;
    }
}
