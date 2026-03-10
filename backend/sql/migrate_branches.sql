-- SQL Migration for Students Branch Column
-- Standardize branch values for Placement Intelligence Portal

-- 1. Optional: Update existing inconsistent values
-- Use this section ONLY IF you already have existing inconsistent entries
-- UPDATE students SET branch = 'DS' WHERE branch = 'Data Science';
-- UPDATE students SET branch = 'IT' WHERE branch = 'Information Technology';
-- UPDATE students SET branch = 'AIML' WHERE branch = 'AI & ML';
-- UPDATE students SET branch = 'CS-Cybersecurity' WHERE branch = 'Cyber Security';
-- UPDATE students SET branch = 'CSE' WHERE branch = 'Computer Science';

-- 2. Alter column to ENUM to strictly enforce allowed values
ALTER TABLE students 
MODIFY COLUMN branch ENUM('DS', 'IT', 'AIML', 'CS-Cybersecurity', 'CSE') NOT NULL;
