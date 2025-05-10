/*
  # Medical Prescription System Schema

  1. New Tables
    - `users` - System users (admins and health agents)
      - `id` (uuid, primary key) - User ID from auth
      - `name` (text) - Full name
      - `role` (text) - Either 'admin' or 'agent'
      - `created_at` (timestamp)
      
    - `patients` - Patient information
      - `id` (uuid, primary key)
      - `name` (text) - Full name
      - `birth_date` (date) - Date of birth
      - `sus_card` (text) - SUS card number
      - `created_at` (timestamp)
      - `created_by` (uuid) - Reference to users.id
      
    - `medications` - Available medications
      - `id` (uuid, primary key)
      - `name` (text) - Medication name
      - `description` (text) - Additional details
      - `created_at` (timestamp)
      
    - `prescriptions` - Medical prescriptions
      - `id` (uuid, primary key)
      - `patient_id` (uuid) - Reference to patients.id
      - `medication_id` (uuid) - Reference to medications.id
      - `doctor_name` (text) - Prescribing doctor
      - `prescription_date` (date) - Date prescribed
      - `valid_until` (date) - Prescription validity
      - `created_at` (timestamp)
      - `created_by` (uuid) - Reference to users.id
      
    - `prescription_pickups` - Medication pickup records
      - `id` (uuid, primary key)
      - `prescription_id` (uuid) - Reference to prescriptions.id
      - `pickup_date` (date) - Date of pickup
      - `next_pickup` (date) - Next scheduled pickup
      - `notes` (text) - Additional notes
      - `created_by` (uuid) - Reference to users.id
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies for admins to have full access
    - Policies for agents to have limited access
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'agent')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Patients table
CREATE TABLE patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  birth_date date NOT NULL,
  sus_card text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) NOT NULL
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Medications table
CREATE TABLE medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Prescriptions table
CREATE TABLE prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) NOT NULL,
  medication_id uuid REFERENCES medications(id) NOT NULL,
  doctor_name text NOT NULL,
  prescription_date date NOT NULL,
  valid_until date NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) NOT NULL
);

ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Prescription pickups table
CREATE TABLE prescription_pickups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid REFERENCES prescriptions(id) NOT NULL,
  pickup_date date NOT NULL,
  next_pickup date,
  notes text,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prescription_pickups ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Patients policies
CREATE POLICY "Admins have full access to patients"
  ON patients
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Agents can read and create patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "Agents can create patients"
  ON patients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Medications policies
CREATE POLICY "All authenticated users can read medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify medications"
  ON medications
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Prescriptions policies
CREATE POLICY "All authenticated users can read prescriptions"
  ON prescriptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create prescriptions"
  ON prescriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Prescription pickups policies
CREATE POLICY "All authenticated users can read pickups"
  ON prescription_pickups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create pickups"
  ON prescription_pickups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid()
    )
  );