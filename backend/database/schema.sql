CREATE DATABASE IF NOT EXISTS placement_portal;
USE placement_portal;

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    branch VARCHAR(100),
    cgpa DECIMAL(4, 2),
    backlogs BOOLEAN DEFAULT FALSE,
    github VARCHAR(255),
    portfolio VARCHAR(255),
    internship_details TEXT,
    resume_path VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    tech_stack VARCHAR(255),
    github_link VARCHAR(255),
    live_link VARCHAR(255),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Insert a default admin (password: admin123)
-- Hash for admin123: $2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1
-- You should generate a real hash in production code or running a script.
-- For now we can use a placeholder or handle it in seeding.

-- --- Department Indexes ---
-- Adding a composite index for faster queries on large sets
CREATE INDEX idx_branch_id ON students (branch, id);
