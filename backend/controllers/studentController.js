const db = require('../config/db');

// @desc    Get current student profile
// @route   GET /api/student/profile
// @access  Private (Student)
const getProfile = async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM students WHERE id = ?', [req.user.id]);
        if (students.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const student = students[0];
        delete student.password;

        // Get skills
        const [skills] = await db.query('SELECT skill_name FROM skills WHERE student_id = ?', [req.user.id]);
        student.skills = skills.map(s => s.skill_name);

        // Get projects
        const [projects] = await db.query('SELECT * FROM projects WHERE student_id = ?', [req.user.id]);
        student.projects = projects;

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update student profile (personal details)
// @route   PUT /api/student/profile
// @access  Private (Student)
const updateProfile = async (req, res) => {
    let { name, phone, alt_phone, personal_email, cgpa, has_backlog, backlog_count, github, portfolio, internship_details } = req.body;

    let final_backlog_count = parseInt(backlog_count) || 0;
    const has_backlog_val = (has_backlog === true || has_backlog === 'true' || has_backlog === 1);

    if (!has_backlog_val) {
        final_backlog_count = 0;
    } else {
        cgpa = null; // Force null when backlogs are present
        if (final_backlog_count < 1) {
            return res.status(400).json({ message: 'Number of active backlogs must be greater than 0.' });
        }
    }

    try {
        await db.query(
            'UPDATE students SET name = ?, phone = ?, alt_phone = ?, personal_email = ?, cgpa = ?, has_backlog = ?, backlog_count = ?, github = ?, portfolio = ?, internship_details = ? WHERE id = ?',
            [name, phone, alt_phone, personal_email, cgpa, has_backlog_val, final_backlog_count, github, portfolio, internship_details, req.user.id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all skills
// @route   GET /api/student/skills
// @access  Private (Student)
const getSkills = async (req, res) => {
    try {
        const [skills] = await db.query('SELECT * FROM skills WHERE student_id = ?', [req.user.id]);
        res.json(skills);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add a skill
// @route   POST /api/student/skills
// @access  Private (Student)
const addSkill = async (req, res) => {
    const { skill } = req.body;
    if (!skill) {
        return res.status(400).json({ message: 'Skill name is required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO skills (student_id, skill_name) VALUES (?, ?)',
            [req.user.id, skill]
        );
        res.status(201).json({ id: result.insertId, skill_name: skill, message: 'Skill added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a skill
// @route   DELETE /api/student/skills/:id
// @access  Private (Student)
const deleteSkill = async (req, res) => {
    try {
        await db.query('DELETE FROM skills WHERE id = ? AND student_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Skill deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add a project
// @route   POST /api/student/projects
// @access  Private (Student)
const addProject = async (req, res) => {
    const { title, description, tech_stack, github_link, live_link } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO projects (student_id, title, description, tech_stack, github_link, live_link) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, title, description, tech_stack, github_link, live_link]
        );
        res.json({ id: result.insertId, message: 'Project added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all projects
// @route   GET /api/student/projects
// @access  Private (Student)
const getProjects = async (req, res) => {
    try {
        const [projects] = await db.query('SELECT * FROM projects WHERE student_id = ?', [req.user.id]);
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a project
// @route   DELETE /api/student/projects/:id
// @access  Private (Student)
const deleteProject = async (req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE id = ? AND student_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Upload resume
// @route   POST /api/student/resume
// @access  Private (Student)
const uploadResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const resumePath = req.file.path.replace(/\\/g, '/'); // Normalize path

    try {
        await db.query('UPDATE students SET resume_path = ? WHERE id = ?', [resumePath, req.user.id]);
        res.json({ message: 'Resume uploaded', path: resumePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get eligible drives for student
// @route   GET /api/student/drives
// @access  Private (Student)
const getEligibleDrives = async (req, res) => {
    try {
        const [students] = await db.query('SELECT branch FROM students WHERE id = ?', [req.user.id]);
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });

        const branch = students[0].branch;

        // Ensure drive_start_date is handled; fallback to drive_date if null
        const [upcoming_drives] = await db.query(
            "SELECT * FROM placement_drives WHERE eligible_departments LIKE ? AND COALESCE(drive_start_date, drive_date) > CURDATE() AND status = 'active' ORDER BY COALESCE(drive_start_date, drive_date) ASC",
            [`%${branch}%`]
        );

        const [ongoing_drives] = await db.query(
            "SELECT * FROM placement_drives WHERE eligible_departments LIKE ? AND COALESCE(drive_start_date, drive_date) <= CURDATE() AND COALESCE(drive_end_date, application_deadline) >= CURDATE() AND status = 'active' ORDER BY COALESCE(drive_start_date, drive_date) ASC",
            [`%${branch}%`]
        );

        res.json({
            upcoming_drives,
            ongoing_drives
        });
    } catch (error) {
        console.error('Error fetching eligible drives:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Apply for a drive
// @route   POST /api/student/drives/apply
// @access  Private (Student)
const applyForDrive = async (req, res) => {
    const { drive_id } = req.body;

    if (!drive_id) {
        return res.status(400).json({ message: 'Drive ID is required' });
    }

    try {
        // Validation: Verify student's branch is in eligible_departments
        const [studentData] = await db.query('SELECT branch FROM students WHERE id = ?', [req.user.id]);
        if (studentData.length === 0) return res.status(404).json({ message: 'Student not found' });
        const studentBranch = studentData[0].branch;

        const [driveData] = await db.query('SELECT eligible_departments FROM placement_drives WHERE id = ?', [drive_id]);
        if (driveData.length === 0) return res.status(404).json({ message: 'Drive not found' });
        const eligibleDepartments = driveData[0].eligible_departments;

        // eligible_departments is stored as a comma-separated string, e.g., "IT,CSE,AIML"
        const isEligible = eligibleDepartments.split(',').map(d => d.trim()).includes(studentBranch);

        if (!isEligible) {
            return res.status(403).json({ message: 'Forbidden: You are not eligible for this drive' });
        }

        // Check if already applied
        const [existing] = await db.query(
            'SELECT * FROM drive_applications WHERE drive_id = ? AND student_id = ?',
            [drive_id, req.user.id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'You have already applied for this drive' });
        }

        await db.query(
            'INSERT INTO drive_applications (drive_id, student_id, status) VALUES (?, ?, ?)',
            [drive_id, req.user.id, 'applied']
        );

        res.status(201).json({ message: 'Applied successfully' });
    } catch (error) {
        console.error('Error applying for drive:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get student's applications
// @route   GET /api/student/applications
// @access  Private (Student)
const getStudentApplications = async (req, res) => {
    try {
        const [applications] = await db.query(`
            SELECT a.id as application_id, d.id as drive_id, d.company_name, d.role, d.drive_date, a.status, a.applied_at
            FROM drive_applications a
            JOIN placement_drives d ON a.drive_id = d.id
            WHERE a.student_id = ?
            ORDER BY a.applied_at DESC
        `, [req.user.id]);

        res.json(applications);
    } catch (error) {
        console.error('Error fetching student applications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get student settings
// @route   GET /api/student/settings
// @access  Private (Student)
const getSettings = async (req, res) => {
    try {
        const [students] = await db.query('SELECT name, email, phone, roll_no, branch, linkedin_url, github_url, portfolio_url FROM students WHERE id = ?', [req.user.id]);
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        
        const [prefs] = await db.query('SELECT drive_notifications, application_updates, shortlist_alerts FROM notification_preferences WHERE user_id = ? AND role = "student"', [req.user.id]);
        
        const settings = {
            account: {
                name: students[0].name,
                email: students[0].email,
                phone: students[0].phone || '',
                roll_no: students[0].roll_no,
                branch: students[0].branch
            },
            links: {
                linkedin_url: students[0].linkedin_url || '',
                github_url: students[0].github_url || '',
                portfolio_url: students[0].portfolio_url || ''
            },
            notifications: prefs.length > 0 ? prefs[0] : { drive_notifications: true, application_updates: true, shortlist_alerts: true }
        };
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update student account info
// @route   PUT /api/student/update-account
// @access  Private (Student)
const updateAccount = async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        await db.query('UPDATE students SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, req.user.id]);
        
        const [updatedStudent] = await db.query('SELECT id, name, email, phone, roll_no, branch FROM students WHERE id = ?', [req.user.id]);
        res.json({ message: 'Account updated successfully', student: updatedStudent[0] });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update student professional links
// @route   PUT /api/student/update-links
// @access  Private (Student)
const updateLinks = async (req, res) => {
    const { linkedin_url, github_url, portfolio_url } = req.body;
    try {
        await db.query('UPDATE students SET linkedin_url = ?, github_url = ?, portfolio_url = ? WHERE id = ?', 
            [linkedin_url, github_url, portfolio_url, req.user.id]);
        res.json({ message: 'Links updated successfully' });
    } catch (error) {
        console.error('Error updating links:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Change student password
// @route   PUT /api/student/change-password
// @access  Private (Student)
const changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    try {
        const [students] = await db.query('SELECT password FROM students WHERE id = ?', [req.user.id]);
        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(current_password, students[0].password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        
        await db.query('UPDATE students SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update student notification settings
// @route   PUT /api/student/notification-settings
// @access  Private (Student)
const updateNotificationSettings = async (req, res) => {
    const { drive_notifications, application_updates, shortlist_alerts } = req.body;
    try {
        const [existing] = await db.query('SELECT id FROM notification_preferences WHERE user_id = ? AND role = "student"', [req.user.id]);
        
        if (existing.length > 0) {
            await db.query(`UPDATE notification_preferences 
                SET drive_notifications = ?, application_updates = ?, shortlist_alerts = ? 
                WHERE id = ?`, 
                [drive_notifications, application_updates, shortlist_alerts, existing[0].id]);
        } else {
            await db.query(`INSERT INTO notification_preferences 
                (user_id, role, drive_notifications, application_updates, shortlist_alerts) 
                VALUES (?, "student", ?, ?, ?)`, 
                [req.user.id, drive_notifications, application_updates, shortlist_alerts]);
        }
        res.json({ message: 'Notification preferences updated successfully' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getProfile, updateProfile, getSkills, addSkill, deleteSkill, getProjects, addProject, deleteProject, uploadResume,
    getEligibleDrives, applyForDrive, getStudentApplications,
    getSettings, updateAccount, updateLinks, changePassword, updateNotificationSettings
};
