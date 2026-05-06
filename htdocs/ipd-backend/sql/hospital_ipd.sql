SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS hospital_ipd
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hospital_ipd;

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id BIGINT UNSIGNED NOT NULL,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(150) DEFAULT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  status ENUM('active', 'inactive', 'locked') NOT NULL DEFAULT 'active',
  last_login_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_users_username (username),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role_status (role_id, status),
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  doctor_code VARCHAR(50) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  department VARCHAR(150) DEFAULT NULL,
  specialization VARCHAR(150) DEFAULT NULL,
  license_number VARCHAR(80) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_doctors_code (doctor_code),
  UNIQUE KEY uk_doctors_user (user_id),
  UNIQUE KEY uk_doctors_license (license_number),
  KEY idx_doctors_status_department (status, department),
  CONSTRAINT fk_doctors_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nurses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  nurse_code VARCHAR(50) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  designation VARCHAR(150) DEFAULT NULL,
  license_number VARCHAR(80) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_nurses_code (nurse_code),
  UNIQUE KEY uk_nurses_user (user_id),
  UNIQUE KEY uk_nurses_license (license_number),
  KEY idx_nurses_status_designation (status, designation),
  CONSTRAINT fk_nurses_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wards (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ward_code VARCHAR(50) NOT NULL,
  ward_name VARCHAR(150) NOT NULL,
  ward_type VARCHAR(50) DEFAULT NULL,
  floor_label VARCHAR(50) DEFAULT NULL,
  gender_restriction ENUM('male', 'female', 'mixed', 'any') NOT NULL DEFAULT 'any',
  status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_wards_code (ward_code),
  KEY idx_wards_status_name (status, ward_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ward_id BIGINT UNSIGNED NOT NULL,
  room_code VARCHAR(50) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(50) DEFAULT NULL,
  status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_rooms_code (room_code),
  UNIQUE KEY uk_rooms_ward_number (ward_id, room_number),
  KEY idx_rooms_status_type (status, room_type),
  CONSTRAINT fk_rooms_ward
    FOREIGN KEY (ward_id) REFERENCES wards (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS beds (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id BIGINT UNSIGNED NOT NULL,
  bed_code VARCHAR(50) NOT NULL,
  bed_number VARCHAR(50) NOT NULL,
  bed_label VARCHAR(100) DEFAULT NULL,
  bed_type VARCHAR(50) DEFAULT NULL,
  daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('available', 'occupied', 'cleaning', 'maintenance', 'reserved', 'inactive') NOT NULL DEFAULT 'available',
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_beds_code (bed_code),
  UNIQUE KEY uk_beds_room_number (room_id, bed_number),
  KEY idx_beds_status_type (status, bed_type),
  CONSTRAINT fk_beds_room
    FOREIGN KEY (room_id) REFERENCES rooms (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_code VARCHAR(50) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) DEFAULT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE DEFAULT NULL,
  age_years SMALLINT UNSIGNED DEFAULT NULL,
  gender ENUM('male', 'female', 'other', 'unknown') NOT NULL DEFAULT 'unknown',
  blood_group VARCHAR(5) DEFAULT NULL,
  mobile_primary VARCHAR(20) DEFAULT NULL,
  mobile_secondary VARCHAR(20) DEFAULT NULL,
  email VARCHAR(150) DEFAULT NULL,
  emergency_contact_name VARCHAR(150) DEFAULT NULL,
  emergency_contact_relation VARCHAR(100) DEFAULT NULL,
  emergency_contact_phone VARCHAR(20) DEFAULT NULL,
  patient_type ENUM('general', 'employee', 'dependent', 'other') NOT NULL DEFAULT 'general',
  duplicate_guard_key CHAR(64) DEFAULT NULL,
  status ENUM('active', 'admitted', 'discharged', 'deceased', 'archived') NOT NULL DEFAULT 'active',
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_patients_code (patient_code),
  UNIQUE KEY uk_patients_duplicate_guard (duplicate_guard_key),
  KEY idx_patients_name_mobile (full_name, mobile_primary),
  KEY idx_patients_status_gender (status, gender)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient_addresses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  address_type ENUM('home', 'temporary', 'billing', 'guardian', 'other') NOT NULL DEFAULT 'home',
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  district VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  postal_code VARCHAR(20) DEFAULT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  is_primary TINYINT(1) NOT NULL DEFAULT 1,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_patient_addresses_patient_type (patient_id, address_type, is_primary),
  CONSTRAINT fk_patient_addresses_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED DEFAULT NULL,
  appointment_no VARCHAR(50) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  appointment_type ENUM('consultation', 'review', 'procedure', 'admission', 'other') NOT NULL DEFAULT 'consultation',
  purpose VARCHAR(255) DEFAULT NULL,
  status ENUM('scheduled', 'checked_in', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'scheduled',
  notes TEXT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_appointments_no (appointment_no),
  KEY idx_appointments_schedule (doctor_id, scheduled_at, status),
  KEY idx_appointments_patient_status (patient_id, status),
  CONSTRAINT fk_appointments_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admissions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  appointment_id BIGINT UNSIGNED DEFAULT NULL,
  admission_no VARCHAR(50) NOT NULL,
  ipd_number VARCHAR(50) NOT NULL,
  doctor_id BIGINT UNSIGNED DEFAULT NULL,
  ward_id BIGINT UNSIGNED DEFAULT NULL,
  room_id BIGINT UNSIGNED DEFAULT NULL,
  bed_id BIGINT UNSIGNED DEFAULT NULL,
  admission_source ENUM('opd', 'emergency', 'transfer', 'walk_in', 'other') NOT NULL DEFAULT 'other',
  admission_reason TEXT DEFAULT NULL,
  diagnosis_summary TEXT DEFAULT NULL,
  admission_status ENUM('planned', 'admitted', 'transferred', 'discharged', 'cancelled') NOT NULL DEFAULT 'admitted',
  attendant_name VARCHAR(150) DEFAULT NULL,
  attendant_relation VARCHAR(100) DEFAULT NULL,
  attendant_mobile VARCHAR(20) DEFAULT NULL,
  admitted_at DATETIME NOT NULL,
  expected_discharge_at DATETIME DEFAULT NULL,
  discharged_at DATETIME DEFAULT NULL,
  created_by_user_id BIGINT UNSIGNED DEFAULT NULL,
  updated_by_user_id BIGINT UNSIGNED DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admissions_no (admission_no),
  UNIQUE KEY uk_admissions_ipd (ipd_number),
  KEY idx_admissions_patient_status (patient_id, admission_status),
  KEY idx_admissions_bed_status (bed_id, admission_status),
  KEY idx_admissions_doctor_time (doctor_id, admitted_at),
  CONSTRAINT fk_admissions_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_admissions_appointment
    FOREIGN KEY (appointment_id) REFERENCES appointments (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_admissions_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_admissions_ward
    FOREIGN KEY (ward_id) REFERENCES wards (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_admissions_room
    FOREIGN KEY (room_id) REFERENCES rooms (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_admissions_bed
    FOREIGN KEY (bed_id) REFERENCES beds (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_admissions_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_admissions_updated_by
    FOREIGN KEY (updated_by_user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS discharges (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  discharge_no VARCHAR(50) NOT NULL,
  doctor_id BIGINT UNSIGNED DEFAULT NULL,
  nurse_id BIGINT UNSIGNED DEFAULT NULL,
  discharge_type ENUM('regular', 'lama', 'transfer', 'death', 'absconded') NOT NULL DEFAULT 'regular',
  discharge_status ENUM('draft', 'completed', 'cancelled') NOT NULL DEFAULT 'completed',
  final_diagnosis TEXT DEFAULT NULL,
  discharge_summary TEXT DEFAULT NULL,
  condition_at_discharge VARCHAR(255) DEFAULT NULL,
  follow_up_instructions TEXT DEFAULT NULL,
  attendant_name VARCHAR(150) DEFAULT NULL,
  attendant_relation VARCHAR(100) DEFAULT NULL,
  attendant_mobile VARCHAR(20) DEFAULT NULL,
  discharged_at DATETIME NOT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_discharges_no (discharge_no),
  UNIQUE KEY uk_discharges_admission (admission_id),
  KEY idx_discharges_doctor_time (doctor_id, discharged_at),
  CONSTRAINT fk_discharges_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_discharges_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_discharges_nurse
    FOREIGN KEY (nurse_id) REFERENCES nurses (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bed_allocations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admission_id BIGINT UNSIGNED NOT NULL,
  bed_id BIGINT UNSIGNED NOT NULL,
  ward_id BIGINT UNSIGNED DEFAULT NULL,
  room_id BIGINT UNSIGNED DEFAULT NULL,
  allocated_from DATETIME NOT NULL,
  allocated_to DATETIME DEFAULT NULL,
  allocation_status ENUM('active', 'released', 'transferred', 'cancelled') NOT NULL DEFAULT 'active',
  reason VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_bed_allocations_admission_status (admission_id, allocation_status),
  KEY idx_bed_allocations_bed_status (bed_id, allocation_status),
  KEY idx_bed_allocations_time (allocated_from, allocated_to),
  CONSTRAINT fk_bed_allocations_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_bed_allocations_bed
    FOREIGN KEY (bed_id) REFERENCES beds (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_bed_allocations_ward
    FOREIGN KEY (ward_id) REFERENCES wards (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_bed_allocations_room
    FOREIGN KEY (room_id) REFERENCES rooms (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS diagnoses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  doctor_id BIGINT UNSIGNED DEFAULT NULL,
  diagnosis_type ENUM('provisional', 'final', 'secondary', 'history') NOT NULL DEFAULT 'provisional',
  icd10_code VARCHAR(20) DEFAULT NULL,
  diagnosis_text TEXT NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  diagnosed_at DATETIME NOT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_diagnoses_patient_type (patient_id, diagnosis_type),
  KEY idx_diagnoses_admission_time (admission_id, diagnosed_at),
  KEY idx_diagnoses_doctor_time (doctor_id, diagnosed_at),
  CONSTRAINT fk_diagnoses_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_diagnoses_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_diagnoses_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prescriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  doctor_id BIGINT UNSIGNED DEFAULT NULL,
  prescription_no VARCHAR(50) NOT NULL,
  prescribed_at DATETIME NOT NULL,
  status ENUM('draft', 'active', 'stopped', 'completed') NOT NULL DEFAULT 'active',
  notes TEXT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_prescriptions_no (prescription_no),
  KEY idx_prescriptions_patient_status (patient_id, status),
  KEY idx_prescriptions_admission_time (admission_id, prescribed_at),
  KEY idx_prescriptions_doctor_time (doctor_id, prescribed_at),
  CONSTRAINT fk_prescriptions_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_prescriptions_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_prescriptions_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS medicines (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  medicine_code VARCHAR(50) NOT NULL,
  generic_name VARCHAR(150) NOT NULL,
  brand_name VARCHAR(150) DEFAULT NULL,
  strength VARCHAR(100) DEFAULT NULL,
  dosage_form VARCHAR(100) DEFAULT NULL,
  route VARCHAR(100) DEFAULT NULL,
  manufacturer VARCHAR(150) DEFAULT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_medicines_code (medicine_code),
  KEY idx_medicines_generic_status (generic_name, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prescription_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prescription_id BIGINT UNSIGNED NOT NULL,
  medicine_id BIGINT UNSIGNED NOT NULL,
  dosage VARCHAR(100) DEFAULT NULL,
  frequency VARCHAR(100) DEFAULT NULL,
  duration_days SMALLINT UNSIGNED DEFAULT NULL,
  quantity DECIMAL(10,2) DEFAULT NULL,
  instructions TEXT DEFAULT NULL,
  status ENUM('active', 'stopped', 'completed') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_prescription_items_prescription (prescription_id),
  KEY idx_prescription_items_medicine (medicine_id),
  CONSTRAINT fk_prescription_items_prescription
    FOREIGN KEY (prescription_id) REFERENCES prescriptions (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_prescription_items_medicine
    FOREIGN KEY (medicine_id) REFERENCES medicines (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS investigations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  doctor_id BIGINT UNSIGNED DEFAULT NULL,
  investigation_type ENUM('lab', 'radiology', 'procedure', 'other') NOT NULL DEFAULT 'lab',
  investigation_name VARCHAR(150) NOT NULL,
  order_notes TEXT DEFAULT NULL,
  result_text LONGTEXT DEFAULT NULL,
  result_value VARCHAR(100) DEFAULT NULL,
  unit VARCHAR(50) DEFAULT NULL,
  reference_range VARCHAR(150) DEFAULT NULL,
  status ENUM('ordered', 'collected', 'reported', 'cancelled') NOT NULL DEFAULT 'ordered',
  ordered_at DATETIME NOT NULL,
  reported_at DATETIME DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_investigations_patient_status (patient_id, status),
  KEY idx_investigations_admission_status (admission_id, status),
  KEY idx_investigations_doctor_time (doctor_id, ordered_at),
  CONSTRAINT fk_investigations_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_investigations_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_investigations_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vitals (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  recorded_by_user_id BIGINT UNSIGNED DEFAULT NULL,
  source_form VARCHAR(50) DEFAULT NULL,
  systolic_bp SMALLINT UNSIGNED DEFAULT NULL,
  diastolic_bp SMALLINT UNSIGNED DEFAULT NULL,
  pulse_bpm SMALLINT UNSIGNED DEFAULT NULL,
  respiration_rpm SMALLINT UNSIGNED DEFAULT NULL,
  temperature_c DECIMAL(4,1) DEFAULT NULL,
  spo2_percent DECIMAL(5,2) DEFAULT NULL,
  pain_score TINYINT UNSIGNED DEFAULT NULL,
  weight_kg DECIMAL(5,2) DEFAULT NULL,
  height_cm DECIMAL(5,2) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  recorded_at DATETIME NOT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_vitals_patient_time (patient_id, recorded_at),
  KEY idx_vitals_admission_time (admission_id, recorded_at),
  KEY idx_vitals_source_time (source_form, recorded_at),
  CONSTRAINT fk_vitals_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_vitals_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_vitals_recorded_by
    FOREIGN KEY (recorded_by_user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nursing_assessments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  nurse_id BIGINT UNSIGNED DEFAULT NULL,
  assessment_type ENUM('initial', 'progress', 'discharge') NOT NULL DEFAULT 'initial',
  patient_accompanied TINYINT(1) NOT NULL DEFAULT 0,
  accompanied_name VARCHAR(150) DEFAULT NULL,
  accompanied_relation VARCHAR(100) DEFAULT NULL,
  accompanied_contact VARCHAR(20) DEFAULT NULL,
  primary_language VARCHAR(50) DEFAULT NULL,
  language_other VARCHAR(100) DEFAULT NULL,
  id_band_color VARCHAR(50) DEFAULT NULL,
  vulnerable TINYINT(1) DEFAULT NULL,
  patient_status VARCHAR(50) DEFAULT NULL,
  psychological_status VARCHAR(100) DEFAULT NULL,
  temperature_c DECIMAL(4,1) DEFAULT NULL,
  pulse_bpm SMALLINT UNSIGNED DEFAULT NULL,
  respiration_rpm SMALLINT UNSIGNED DEFAULT NULL,
  spo2_percent DECIMAL(5,2) DEFAULT NULL,
  other_vital VARCHAR(100) DEFAULT NULL,
  pain_present TINYINT(1) DEFAULT NULL,
  pain_score TINYINT UNSIGNED DEFAULT NULL,
  pain_frequency VARCHAR(100) DEFAULT NULL,
  pain_type VARCHAR(100) DEFAULT NULL,
  pain_location VARCHAR(255) DEFAULT NULL,
  action_needed TINYINT(1) DEFAULT NULL,
  orientation_summary TEXT DEFAULT NULL,
  facilities_orientation TEXT DEFAULT NULL,
  allergies_status ENUM('known', 'not_known', 'unknown') NOT NULL DEFAULT 'unknown',
  skin_check TINYINT(1) DEFAULT NULL,
  iv_line_started TINYINT(1) DEFAULT NULL,
  braden_scores TEXT DEFAULT NULL,
  braden_total SMALLINT UNSIGNED DEFAULT NULL,
  braden_risk VARCHAR(50) DEFAULT NULL,
  fall_risk_components TEXT DEFAULT NULL,
  fall_risk_total SMALLINT UNSIGNED DEFAULT NULL,
  fall_risk_level ENUM('low', 'medium', 'high') DEFAULT NULL,
  assessment_date DATE NOT NULL,
  order_datetime DATETIME DEFAULT NULL,
  notes LONGTEXT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_nursing_assessments_patient_date (patient_id, assessment_date),
  KEY idx_nursing_assessments_admission_date (admission_id, assessment_date),
  KEY idx_nursing_assessments_nurse_date (nurse_id, assessment_date),
  CONSTRAINT fk_nursing_assessments_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_nursing_assessments_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_nursing_assessments_nurse
    FOREIGN KEY (nurse_id) REFERENCES nurses (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctor_notes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  doctor_id BIGINT UNSIGNED DEFAULT NULL,
  note_type ENUM('progress', 'consultant', 'initial_assessment') NOT NULL,
  subject VARCHAR(255) DEFAULT NULL,
  progress_report LONGTEXT DEFAULT NULL,
  medication_orders LONGTEXT DEFAULT NULL,
  investigations_text LONGTEXT DEFAULT NULL,
  treatment_text LONGTEXT DEFAULT NULL,
  present_illness LONGTEXT DEFAULT NULL,
  system_evaluation LONGTEXT DEFAULT NULL,
  figure_notes LONGTEXT DEFAULT NULL,
  diagnosis_text LONGTEXT DEFAULT NULL,
  past_history_text LONGTEXT DEFAULT NULL,
  other_findings LONGTEXT DEFAULT NULL,
  orders_legible TINYINT(1) NOT NULL DEFAULT 0,
  note_datetime DATETIME DEFAULT NULL,
  extra_payload LONGTEXT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_doctor_notes_patient_type (patient_id, note_type),
  KEY idx_doctor_notes_admission_time (admission_id, note_datetime),
  KEY idx_doctor_notes_doctor_time (doctor_id, note_datetime),
  CONSTRAINT fk_doctor_notes_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_doctor_notes_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_doctor_notes_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS consent_forms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED DEFAULT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  consent_type ENUM('serious_patient_english', 'serious_patient_hindi') NOT NULL,
  patient_name_snapshot VARCHAR(150) DEFAULT NULL,
  relation_to_patient VARCHAR(100) DEFAULT NULL,
  signer_name VARCHAR(150) DEFAULT NULL,
  signer_age VARCHAR(20) DEFAULT NULL,
  signer_gender VARCHAR(30) DEFAULT NULL,
  signer_address TEXT DEFAULT NULL,
  signer_mobile VARCHAR(20) DEFAULT NULL,
  signer_signature VARCHAR(150) DEFAULT NULL,
  relative_of VARCHAR(150) DEFAULT NULL,
  witness_name VARCHAR(150) DEFAULT NULL,
  witness_relation VARCHAR(100) DEFAULT NULL,
  witness_address TEXT DEFAULT NULL,
  witness_mobile VARCHAR(20) DEFAULT NULL,
  witness_signature VARCHAR(150) DEFAULT NULL,
  consent_place VARCHAR(150) DEFAULT NULL,
  consent_time VARCHAR(30) DEFAULT NULL,
  witness_place VARCHAR(150) DEFAULT NULL,
  witness_time VARCHAR(30) DEFAULT NULL,
  consent_date DATE DEFAULT NULL,
  witness_date DATE DEFAULT NULL,
  payload LONGTEXT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_consent_forms_patient_type (patient_id, consent_type),
  KEY idx_consent_forms_admission_type (admission_id, consent_type),
  KEY idx_consent_forms_dates (consent_date, witness_date),
  CONSTRAINT fk_consent_forms_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_consent_forms_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  bill_no VARCHAR(50) NOT NULL,
  status ENUM('draft', 'generated', 'partially_paid', 'paid', 'cancelled') NOT NULL DEFAULT 'draft',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  due_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  notes TEXT DEFAULT NULL,
  generated_at DATETIME NOT NULL,
  created_by_user_id BIGINT UNSIGNED DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_billing_no (bill_no),
  KEY idx_billing_patient_status (patient_id, status),
  KEY idx_billing_admission_status (admission_id, status),
  KEY idx_billing_generated_at (generated_at),
  CONSTRAINT fk_billing_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_billing_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_billing_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS billing_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  billing_id BIGINT UNSIGNED NOT NULL,
  item_category VARCHAR(50) DEFAULT NULL,
  item_description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  line_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_billing_items_billing (billing_id),
  CONSTRAINT fk_billing_items_billing
    FOREIGN KEY (billing_id) REFERENCES billing (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  billing_id BIGINT UNSIGNED NOT NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  invoice_no VARCHAR(50) NOT NULL,
  status ENUM('issued', 'paid', 'partially_paid', 'overdue', 'void') NOT NULL DEFAULT 'issued',
  issued_at DATETIME NOT NULL,
  due_at DATETIME DEFAULT NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  balance_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  notes TEXT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_invoices_billing (billing_id),
  UNIQUE KEY uk_invoices_no (invoice_no),
  KEY idx_invoices_patient_status (patient_id, status),
  KEY idx_invoices_admission_status (admission_id, status),
  KEY idx_invoices_issued_at (issued_at),
  CONSTRAINT fk_invoices_billing
    FOREIGN KEY (billing_id) REFERENCES billing (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_invoices_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_invoices_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  billing_id BIGINT UNSIGNED NOT NULL,
  invoice_id BIGINT UNSIGNED DEFAULT NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  admission_id BIGINT UNSIGNED DEFAULT NULL,
  payment_no VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cash', 'card', 'upi', 'net_banking', 'insurance', 'cheque', 'other') NOT NULL DEFAULT 'cash',
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'completed',
  transaction_reference VARCHAR(100) DEFAULT NULL,
  paid_at DATETIME NOT NULL,
  received_by_user_id BIGINT UNSIGNED DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  deleted_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_payments_no (payment_no),
  KEY idx_payments_billing_time (billing_id, paid_at),
  KEY idx_payments_invoice_status (invoice_id, payment_status),
  KEY idx_payments_patient_status (patient_id, payment_status),
  CONSTRAINT fk_payments_billing
    FOREIGN KEY (billing_id) REFERENCES billing (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_payments_invoice
    FOREIGN KEY (invoice_id) REFERENCES invoices (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_payments_patient
    FOREIGN KEY (patient_id) REFERENCES patients (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_payments_admission
    FOREIGN KEY (admission_id) REFERENCES admissions (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_payments_received_by
    FOREIGN KEY (received_by_user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id BIGINT UNSIGNED DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  request_method VARCHAR(10) DEFAULT NULL,
  endpoint VARCHAR(255) DEFAULT NULL,
  old_values LONGTEXT DEFAULT NULL,
  new_values LONGTEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_logs_user_time (user_id, created_at),
  KEY idx_audit_logs_entity (entity_type, entity_id),
  KEY idx_audit_logs_action_time (action, created_at),
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Sample credentials for all seeded users:
-- username: admin / doctor.aarav / nurse.sneha / billing.anil
-- password: Admin@123

INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
  (1, 'admin', 'Full system administrator', NOW(), NOW()),
  (2, 'doctor', 'Medical practitioner', NOW(), NOW()),
  (3, 'nurse', 'Nursing staff', NOW(), NOW()),
  (4, 'billing', 'Billing and accounts operator', NOW(), NOW()),
  (5, 'receptionist', 'Front office operator', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  updated_at = VALUES(updated_at);

INSERT INTO users (id, role_id, username, email, password_hash, full_name, phone, status, created_at, updated_at) VALUES
  (1, 1, 'admin', 'admin@ujjivanhospital.local', '$2y$10$Rdnh1mcHtRZrt3JlfoeeHOnWI2geTI50nGZnLEnSN2E4q0JlV3KHW', 'System Administrator', '9999999999', 'active', NOW(), NOW()),
  (2, 2, 'doctor.aarav', 'doctor.aarav@ujjivanhospital.local', '$2y$10$Rdnh1mcHtRZrt3JlfoeeHOnWI2geTI50nGZnLEnSN2E4q0JlV3KHW', 'Dr. Aarav Mehta', '9876543210', 'active', NOW(), NOW()),
  (3, 3, 'nurse.sneha', 'nurse.sneha@ujjivanhospital.local', '$2y$10$Rdnh1mcHtRZrt3JlfoeeHOnWI2geTI50nGZnLEnSN2E4q0JlV3KHW', 'Sneha Verma', '9876501234', 'active', NOW(), NOW()),
  (4, 4, 'billing.anil', 'billing.anil@ujjivanhospital.local', '$2y$10$Rdnh1mcHtRZrt3JlfoeeHOnWI2geTI50nGZnLEnSN2E4q0JlV3KHW', 'Anil Sharma', '9811100000', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  password_hash = VALUES(password_hash),
  full_name = VALUES(full_name),
  phone = VALUES(phone),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO doctors (id, user_id, doctor_code, full_name, department, specialization, license_number, phone, email, status, created_at, updated_at) VALUES
  (1, 2, 'DOC-0001', 'Dr. Aarav Mehta', 'General Medicine', 'Internal Medicine', 'LIC-DOC-1001', '9876543210', 'doctor.aarav@ujjivanhospital.local', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  department = VALUES(department),
  specialization = VALUES(specialization),
  phone = VALUES(phone),
  email = VALUES(email),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO nurses (id, user_id, nurse_code, full_name, designation, license_number, phone, email, status, created_at, updated_at) VALUES
  (1, 3, 'NUR-0001', 'Sneha Verma', 'Senior Staff Nurse', 'LIC-NUR-2001', '9876501234', 'nurse.sneha@ujjivanhospital.local', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  designation = VALUES(designation),
  phone = VALUES(phone),
  email = VALUES(email),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO wards (id, ward_code, ward_name, ward_type, floor_label, gender_restriction, status, created_at, updated_at) VALUES
  (1, 'WARD-GEN', 'General Ward', 'general', 'Ground Floor', 'mixed', 'active', NOW(), NOW()),
  (2, 'WARD-PAL', 'Palliative Ward', 'palliative', 'First Floor', 'mixed', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  ward_name = VALUES(ward_name),
  ward_type = VALUES(ward_type),
  floor_label = VALUES(floor_label),
  gender_restriction = VALUES(gender_restriction),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO rooms (id, ward_id, room_code, room_number, room_type, status, created_at, updated_at) VALUES
  (1, 1, 'ROOM-GEN-01', 'G-101', 'shared', 'active', NOW(), NOW()),
  (2, 2, 'ROOM-PAL-01', 'P-201', 'semi_private', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  ward_id = VALUES(ward_id),
  room_number = VALUES(room_number),
  room_type = VALUES(room_type),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO beds (id, room_id, bed_code, bed_number, bed_label, bed_type, daily_rate, status, created_at, updated_at) VALUES
  (1, 1, 'BED-G101-A', 'A', 'G-101 / Bed A', 'standard', 1500.00, 'available', NOW(), NOW()),
  (2, 1, 'BED-G101-B', 'B', 'G-101 / Bed B', 'standard', 1500.00, 'available', NOW(), NOW()),
  (3, 2, 'BED-P201-A', 'A', 'P-201 / Bed A', 'palliative', 2200.00, 'occupied', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  room_id = VALUES(room_id),
  bed_number = VALUES(bed_number),
  bed_label = VALUES(bed_label),
  bed_type = VALUES(bed_type),
  daily_rate = VALUES(daily_rate),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO patients (id, patient_code, first_name, middle_name, last_name, full_name, date_of_birth, age_years, gender, mobile_primary, email, emergency_contact_name, emergency_contact_relation, emergency_contact_phone, patient_type, duplicate_guard_key, status, created_at, updated_at) VALUES
  (1, 'UHID-10001', 'Rohan', NULL, 'Sharma', 'Rohan Sharma', '1988-05-14', 37, 'male', '9000000001', 'rohan.sharma@example.com', 'Meera Sharma', 'Spouse', '9000000002', 'general', '02dbd8dc4f88ef7c2b523e9ecb0adf6ed9e03d8d83098e1d85cbeb72e6ab0f6a', 'admitted', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  age_years = VALUES(age_years),
  gender = VALUES(gender),
  mobile_primary = VALUES(mobile_primary),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO patient_addresses (id, patient_id, address_type, address_line_1, city, district, state, postal_code, country, is_primary, created_at, updated_at) VALUES
  (1, 1, 'home', 'Sector 12, Dadri', 'Dadri', 'Gautam Budh Nagar', 'Uttar Pradesh', '203207', 'India', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  address_line_1 = VALUES(address_line_1),
  city = VALUES(city),
  district = VALUES(district),
  state = VALUES(state),
  postal_code = VALUES(postal_code),
  country = VALUES(country),
  is_primary = VALUES(is_primary),
  updated_at = VALUES(updated_at);

INSERT INTO appointments (id, patient_id, doctor_id, appointment_no, scheduled_at, appointment_type, purpose, status, notes, created_at, updated_at) VALUES
  (1, 1, 1, 'APT-10001', NOW(), 'admission', 'IPD admission review', 'completed', 'Converted to admission', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  scheduled_at = VALUES(scheduled_at),
  appointment_type = VALUES(appointment_type),
  purpose = VALUES(purpose),
  status = VALUES(status),
  notes = VALUES(notes),
  updated_at = VALUES(updated_at);

INSERT INTO admissions (id, patient_id, appointment_id, admission_no, ipd_number, doctor_id, ward_id, room_id, bed_id, admission_source, admission_reason, diagnosis_summary, admission_status, attendant_name, attendant_relation, attendant_mobile, admitted_at, created_at, updated_at) VALUES
  (1, 1, 1, 'ADM-10001', 'IPD-10001', 1, 2, 2, 3, 'opd', 'Pain and palliative management', 'Metastatic disease requiring palliative admission', 'admitted', 'Meera Sharma', 'Spouse', '9000000002', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  doctor_id = VALUES(doctor_id),
  ward_id = VALUES(ward_id),
  room_id = VALUES(room_id),
  bed_id = VALUES(bed_id),
  admission_reason = VALUES(admission_reason),
  diagnosis_summary = VALUES(diagnosis_summary),
  admission_status = VALUES(admission_status),
  attendant_name = VALUES(attendant_name),
  attendant_relation = VALUES(attendant_relation),
  attendant_mobile = VALUES(attendant_mobile),
  admitted_at = VALUES(admitted_at),
  updated_at = VALUES(updated_at);

INSERT INTO bed_allocations (id, admission_id, bed_id, ward_id, room_id, allocated_from, allocation_status, reason, created_at, updated_at) VALUES
  (1, 1, 3, 2, 2, NOW(), 'active', 'Initial admission allocation', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  bed_id = VALUES(bed_id),
  ward_id = VALUES(ward_id),
  room_id = VALUES(room_id),
  allocated_from = VALUES(allocated_from),
  allocation_status = VALUES(allocation_status),
  reason = VALUES(reason),
  updated_at = VALUES(updated_at);

INSERT INTO diagnoses (id, patient_id, admission_id, doctor_id, diagnosis_type, diagnosis_text, is_primary, diagnosed_at, created_at, updated_at) VALUES
  (1, 1, 1, 1, 'provisional', 'Severe chronic pain with advanced illness requiring IPD care', 1, NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  diagnosis_text = VALUES(diagnosis_text),
  is_primary = VALUES(is_primary),
  diagnosed_at = VALUES(diagnosed_at),
  updated_at = VALUES(updated_at);

INSERT INTO medicines (id, medicine_code, generic_name, brand_name, strength, dosage_form, route, manufacturer, status, created_at, updated_at) VALUES
  (1, 'MED-0001', 'Paracetamol', 'Calpol', '650 mg', 'Tablet', 'Oral', 'GSK', 'active', NOW(), NOW()),
  (2, 'MED-0002', 'Pantoprazole', 'Pantocid', '40 mg', 'Tablet', 'Oral', 'Sun Pharma', 'active', NOW(), NOW()),
  (3, 'MED-0003', 'Ondansetron', 'Emeset', '4 mg', 'Injection', 'IV', 'Cipla', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  generic_name = VALUES(generic_name),
  brand_name = VALUES(brand_name),
  strength = VALUES(strength),
  dosage_form = VALUES(dosage_form),
  route = VALUES(route),
  manufacturer = VALUES(manufacturer),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO prescriptions (id, patient_id, admission_id, doctor_id, prescription_no, prescribed_at, status, notes, created_at, updated_at) VALUES
  (1, 1, 1, 1, 'RX-10001', NOW(), 'active', 'Baseline pain management prescription', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  prescribed_at = VALUES(prescribed_at),
  status = VALUES(status),
  notes = VALUES(notes),
  updated_at = VALUES(updated_at);

INSERT INTO prescription_items (id, prescription_id, medicine_id, dosage, frequency, duration_days, quantity, instructions, status, created_at, updated_at) VALUES
  (1, 1, 1, '1 tablet', 'TDS', 5, 15, 'After food', 'active', NOW(), NOW()),
  (2, 1, 2, '1 tablet', 'OD', 5, 5, 'Before breakfast', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  dosage = VALUES(dosage),
  frequency = VALUES(frequency),
  duration_days = VALUES(duration_days),
  quantity = VALUES(quantity),
  instructions = VALUES(instructions),
  status = VALUES(status),
  updated_at = VALUES(updated_at);

INSERT INTO investigations (id, patient_id, admission_id, doctor_id, investigation_type, investigation_name, order_notes, status, ordered_at, created_at, updated_at) VALUES
  (1, 1, 1, 1, 'lab', 'Complete Blood Count', 'Routine admission workup', 'ordered', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  order_notes = VALUES(order_notes),
  status = VALUES(status),
  ordered_at = VALUES(ordered_at),
  updated_at = VALUES(updated_at);

INSERT INTO vitals (id, patient_id, admission_id, recorded_by_user_id, source_form, systolic_bp, diastolic_bp, pulse_bpm, respiration_rpm, temperature_c, spo2_percent, pain_score, notes, recorded_at, created_at, updated_at) VALUES
  (1, 1, 1, 3, 'nursing_initial', 118, 78, 84, 18, 36.7, 97.00, 3, 'Initial admission vitals', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  systolic_bp = VALUES(systolic_bp),
  diastolic_bp = VALUES(diastolic_bp),
  pulse_bpm = VALUES(pulse_bpm),
  respiration_rpm = VALUES(respiration_rpm),
  temperature_c = VALUES(temperature_c),
  spo2_percent = VALUES(spo2_percent),
  pain_score = VALUES(pain_score),
  notes = VALUES(notes),
  recorded_at = VALUES(recorded_at),
  updated_at = VALUES(updated_at);

INSERT INTO nursing_assessments (id, patient_id, admission_id, nurse_id, assessment_type, patient_accompanied, accompanied_name, accompanied_relation, accompanied_contact, primary_language, vulnerable, patient_status, psychological_status, temperature_c, pulse_bpm, respiration_rpm, spo2_percent, pain_present, pain_score, pain_frequency, pain_type, pain_location, action_needed, orientation_summary, facilities_orientation, allergies_status, skin_check, iv_line_started, braden_scores, braden_total, braden_risk, fall_risk_components, fall_risk_total, fall_risk_level, assessment_date, order_datetime, notes, created_at, updated_at) VALUES
  (1, 1, 1, 1, 'initial', 1, 'Meera Sharma', 'Spouse', '9000000002', 'hindi', 0, 'conscious', 'calm', 36.7, 84, 18, 97.00, 1, 3, 'Intermittent', 'Aching', 'Back', 1, 'Patient and attendant oriented to room and services', '[\"Room\",\"Washroom\",\"Patient Rights & Responsibilities\"]', 'known', 1, 1, '[3,3,2,2,3,2]', 15, 'Mild Risk', '{\"fallHistory\":0,\"secondaryDiagnosis\":15,\"ambulatoryAid\":0,\"ivHeparin\":0,\"gait\":10,\"mentalStatus\":0}', 25, 'medium', CURDATE(), NOW(), 'Seed nursing assessment', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  patient_status = VALUES(patient_status),
  psychological_status = VALUES(psychological_status),
  temperature_c = VALUES(temperature_c),
  pulse_bpm = VALUES(pulse_bpm),
  respiration_rpm = VALUES(respiration_rpm),
  spo2_percent = VALUES(spo2_percent),
  pain_present = VALUES(pain_present),
  pain_score = VALUES(pain_score),
  braden_scores = VALUES(braden_scores),
  braden_total = VALUES(braden_total),
  braden_risk = VALUES(braden_risk),
  fall_risk_components = VALUES(fall_risk_components),
  fall_risk_total = VALUES(fall_risk_total),
  fall_risk_level = VALUES(fall_risk_level),
  assessment_date = VALUES(assessment_date),
  order_datetime = VALUES(order_datetime),
  notes = VALUES(notes),
  updated_at = VALUES(updated_at);

INSERT INTO doctor_notes (id, patient_id, admission_id, doctor_id, note_type, subject, progress_report, medication_orders, investigations_text, treatment_text, diagnosis_text, orders_legible, note_datetime, extra_payload, created_at, updated_at) VALUES
  (1, 1, 1, 1, 'progress', 'Daily progress review', 'Patient is comfortable, pain score improved.', 'PARACETAMOL 650 MG TDS', 'CBC, RFT', 'Continue analgesics and hydration', 'Palliative pain management', 1, NOW(), '{\"source\":\"seed\"}', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  subject = VALUES(subject),
  progress_report = VALUES(progress_report),
  medication_orders = VALUES(medication_orders),
  investigations_text = VALUES(investigations_text),
  treatment_text = VALUES(treatment_text),
  diagnosis_text = VALUES(diagnosis_text),
  orders_legible = VALUES(orders_legible),
  note_datetime = VALUES(note_datetime),
  extra_payload = VALUES(extra_payload),
  updated_at = VALUES(updated_at);

INSERT INTO consent_forms (id, patient_id, admission_id, consent_type, patient_name_snapshot, relation_to_patient, signer_name, signer_age, signer_gender, signer_address, signer_mobile, signer_signature, relative_of, witness_name, witness_relation, witness_address, witness_mobile, witness_signature, consent_place, consent_time, witness_place, witness_time, consent_date, witness_date, payload, created_at, updated_at) VALUES
  (1, 1, 1, 'serious_patient_english', 'Rohan Sharma', 'Spouse', 'Meera Sharma', '34', 'female', 'Sector 12, Dadri', '9000000002', 'Meera Sharma', 'Rajesh Kumar', 'Amit Singh', 'Friend', 'Noida', '9000000011', 'Amit Singh', 'Dadri', '10:30', 'Dadri', '10:35', CURDATE(), CURDATE(), '{\"source\":\"seed\"}', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  patient_name_snapshot = VALUES(patient_name_snapshot),
  relation_to_patient = VALUES(relation_to_patient),
  signer_name = VALUES(signer_name),
  signer_mobile = VALUES(signer_mobile),
  witness_name = VALUES(witness_name),
  witness_mobile = VALUES(witness_mobile),
  consent_date = VALUES(consent_date),
  witness_date = VALUES(witness_date),
  payload = VALUES(payload),
  updated_at = VALUES(updated_at);

INSERT INTO billing (id, patient_id, admission_id, bill_no, status, subtotal, discount_amount, tax_amount, total_amount, due_amount, notes, generated_at, created_by_user_id, created_at, updated_at) VALUES
  (1, 1, 1, 'BILL-10001', 'partially_paid', 3500.00, 0.00, 180.00, 3680.00, 1680.00, 'Admission charges and nursing care', NOW(), 4, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  subtotal = VALUES(subtotal),
  discount_amount = VALUES(discount_amount),
  tax_amount = VALUES(tax_amount),
  total_amount = VALUES(total_amount),
  due_amount = VALUES(due_amount),
  notes = VALUES(notes),
  generated_at = VALUES(generated_at),
  created_by_user_id = VALUES(created_by_user_id),
  updated_at = VALUES(updated_at);

INSERT INTO billing_items (id, billing_id, item_category, item_description, quantity, unit_price, tax_amount, line_total, created_at, updated_at) VALUES
  (1, 1, 'bed', 'Palliative bed charges', 1.00, 2200.00, 110.00, 2310.00, NOW(), NOW()),
  (2, 1, 'nursing', 'Nursing assessment and monitoring', 1.00, 1300.00, 70.00, 1370.00, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  item_category = VALUES(item_category),
  item_description = VALUES(item_description),
  quantity = VALUES(quantity),
  unit_price = VALUES(unit_price),
  tax_amount = VALUES(tax_amount),
  line_total = VALUES(line_total),
  updated_at = VALUES(updated_at);

INSERT INTO invoices (id, billing_id, patient_id, admission_id, invoice_no, status, issued_at, due_at, subtotal, discount_amount, tax_amount, total_amount, balance_amount, notes, created_at, updated_at) VALUES
  (1, 1, 1, 1, 'INV-10001', 'partially_paid', NOW(), DATE_ADD(NOW(), INTERVAL 2 DAY), 3500.00, 0.00, 180.00, 3680.00, 1680.00, 'Seed invoice', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  issued_at = VALUES(issued_at),
  due_at = VALUES(due_at),
  subtotal = VALUES(subtotal),
  discount_amount = VALUES(discount_amount),
  tax_amount = VALUES(tax_amount),
  total_amount = VALUES(total_amount),
  balance_amount = VALUES(balance_amount),
  notes = VALUES(notes),
  updated_at = VALUES(updated_at);

INSERT INTO payments (id, billing_id, invoice_id, patient_id, admission_id, payment_no, amount, payment_method, payment_status, transaction_reference, paid_at, received_by_user_id, notes, created_at, updated_at) VALUES
  (1, 1, 1, 1, 1, 'PAY-10001', 2000.00, 'upi', 'completed', 'UPI-REF-10001', NOW(), 4, 'Advance payment received', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  amount = VALUES(amount),
  payment_method = VALUES(payment_method),
  payment_status = VALUES(payment_status),
  transaction_reference = VALUES(transaction_reference),
  paid_at = VALUES(paid_at),
  received_by_user_id = VALUES(received_by_user_id),
  notes = VALUES(notes),
  updated_at = VALUES(updated_at);

INSERT INTO audit_logs (id, user_id, entity_type, entity_id, action, request_method, endpoint, old_values, new_values, ip_address, user_agent, created_at) VALUES
  (1, 1, 'billing', 1, 'seed_insert', 'SYSTEM', '/sql/hospital_ipd.sql', NULL, '{\"bill_no\":\"BILL-10001\"}', '127.0.0.1', 'phpMyAdmin seed', NOW())
ON DUPLICATE KEY UPDATE
  new_values = VALUES(new_values),
  ip_address = VALUES(ip_address),
  user_agent = VALUES(user_agent),
  created_at = VALUES(created_at);
