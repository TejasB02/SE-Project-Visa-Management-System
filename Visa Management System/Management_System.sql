-- Create the database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'VISAMANAGEMENT')
BEGIN
    CREATE DATABASE VISAMANAGEMENT;
END

USE VISAMANAGEMENT;

-- Create visa_types table
CREATE TABLE visa_types (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO visa_types (name, description) VALUES
  ('Tourist Visa', 'for Tourist Visa'),
  ('Business Visa', 'for Business Visa'),
  ('Student Visa', 'for Student Visa');

-- Create visa_requirements table
CREATE TABLE visa_requirements (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  visa_type_id INT NOT NULL,
  requirement VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visa_type_id) REFERENCES visa_types (id)
);

-- Create visa_applicants table
CREATE TABLE visa_applicants (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  passport_number VARCHAR(20) UNIQUE,
  date_of_birth DATE,
  nationality VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create visa_applications table
CREATE TABLE visa_applications (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  visa_type_id INT NOT NULL,
  applicant_id INT NOT NULL,
  application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  application_status VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visa_type_id) REFERENCES visa_types (id),
  FOREIGN KEY (applicant_id) REFERENCES visa_applicants (id)
);

-- Create payments table
CREATE TABLE payments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES visa_applications (id)
);

-- Create notifications table
CREATE TABLE notifications (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  notification_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES visa_applications (id)
);

CREATE TABLE visa_application_documents (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  visa_application_id INT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(255) NOT NULL,
  document_size INT NOT NULL,
  document_data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visa_application_id) REFERENCES visa_applications (id)
);

-- Create consulates table
CREATE TABLE consulates (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  consulate_name VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create consular_officers table
CREATE TABLE consular_officers (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  consulate_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (consulate_id) REFERENCES consulates (id)
);
