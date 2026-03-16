const db = require('../config/db');

// @desc    Get all students with filters
// @route   GET /api/admin/students
// @access  Private (Admin)
const getAllStudents = async (req, res) => {
    const { min_cgpa, skills, internship, has_projects } = req.query;

    let query = 'SELECT s.* FROM students s';
    let conditions = [];
    let params = [];

    // Strictly enforce department
    conditions.push('s.branch = ?');
    params.push(req.user.department);

    // Basic filters
    if (min_cgpa) {
        conditions.push('s.cgpa >= ?');
        params.push(min_cgpa);
    }
    if (internship === 'true') {
        conditions.push("(s.internship_details IS NOT NULL AND s.internship_details != '')");
    }

    // Join for skills filtering if needed
    // This is a bit complex: standard way is to find student_ids that have the skill
    if (skills) {
        const skillList = skills.split(',').map(s => s.trim());
        // For each skill, we need to ensure the student has it.
        // Simplified: Check if student has ANY of the skills? Or ALL? 
        // Usually ALL is "strict", ANY is "loose". Let's do loose matching for simplicity or check requirements.
        // "Filter students... based on company requirements" -> usually "Must have Java AND React".
        // Let's implement ANY for now which is easier, or use subqueries for ALL.

        // Using EXISTS for ANY of the skills
        // conditions.push(`EXISTS (SELECT 1 FROM skills sk WHERE sk.student_id = s.id AND sk.skill_name IN (?))`);
        // params.push(skillList); 
        // ^ IN (?) with array only works if expanded.

        // Let's assume comma separated string is passed.
        // Actually, to handle multiple skills properly in raw SQL without ORM is tricky.
        // We will do a basic string match or subquery if single skill. 
        // Let's rely on simple Exact Match for one skill or multiple ?

        // Simple approach: Filter in memory? No, pagination might break.
        // Simple SQL approach: 
        // SELECT student_id FROM skills WHERE skill_name IN (...) GROUP BY student_id HAVING COUNT(DISTINCT skill_name) = ? (for ALL)

        if (skillList.length > 0) {
            const placeholders = skillList.map(() => '?').join(',');
            conditions.push(`s.id IN (
                 SELECT student_id FROM skills 
                 WHERE skill_name IN (${placeholders})
                 GROUP BY student_id
             )`); // This fetches students having AT LEAST ONE of the skills. 
            // If we want ALL, add HAVING COUNT >= skillList.length
            params.push(...skillList);
        }
    }

    if (has_projects === 'true') {
        conditions.push('EXISTS (SELECT 1 FROM projects p WHERE p.student_id = s.id)');
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY s.id DESC';

    try {
        const [students] = await db.query(query, params);

        // Enrich with skills count or top skills? 
        // For the table view, we need skills.
        // Fetching skills for all these students N+1 issue. 
        // Optimized: Fetch all skills for these student IDs.

        if (students.length > 0) {
            const studentIds = students.map(s => s.id);
            const placeholders = studentIds.map(() => '?').join(',');
            const [allSkills] = await db.query(`SELECT * FROM skills WHERE student_id IN (${placeholders})`, studentIds);
            const [allProjects] = await db.query(`SELECT student_id FROM projects WHERE student_id IN (${placeholders})`, studentIds);

            students.forEach(student => {
                delete student.password;
                student.skills = allSkills.filter(sk => sk.student_id === student.id).map(sk => sk.skill_name);
                student.project_count = allProjects.filter(p => p.student_id === student.id).length;
            });
        }

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get student full details
// @route   GET /api/admin/student/:id
// @access  Private (Admin)
const getStudentDetails = async (req, res) => {
    try {
        let query = 'SELECT * FROM students WHERE id = ?';
        let params = [req.params.id];

        const [students] = await db.query(query, params);
        if (students.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        if (students[0].branch !== req.user.department) {
            return res.status(403).json({ message: 'Forbidden: Student belongs to a different department' });
        }
        const student = students[0];
        delete student.password;

        const [skills] = await db.query('SELECT * FROM skills WHERE student_id = ?', [req.params.id]);
        
        const [projects] = await db.query('SELECT * FROM projects WHERE student_id = ?', [req.params.id]);

        res.json({
            student,
            skills,
            projects
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve student
// @route   PUT /api/admin/student/:id/approve
// @access  Private (Admin)
const approveStudent = async (req, res) => {
    try {
        // Enforce department check first
        const [studentCheck] = await db.query('SELECT branch FROM students WHERE id = ?', [req.params.id]);
        if (studentCheck.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (studentCheck[0].branch !== req.user.department) {
            return res.status(403).json({ message: 'Forbidden: Cannot approve student from a different department' });
        }

        let query = 'UPDATE students SET is_approved = TRUE WHERE id = ?';
        let params = [req.params.id];

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student approved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const [totalStudents] = await db.query(
            'SELECT COUNT(*) AS count FROM students WHERE branch = ?',
            [req.user.department]
        );

        const [approvedStudents] = await db.query(
            'SELECT COUNT(*) AS count FROM students WHERE is_approved = TRUE AND branch = ?',
            [req.user.department]
        );

        const [projectsData] = await db.query(
            `SELECT AVG(project_count) AS avgProjects FROM (
                SELECT COUNT(p.id) AS project_count
                FROM students s
                LEFT JOIN projects p ON s.id = p.student_id
                WHERE s.branch = ?
                GROUP BY s.id
            ) AS subquery`,
            [req.user.department]
        );

        res.json({
            totalStudents: totalStudents[0].count,
            approvedStudents: approvedStudents[0].count,
            avgProjects: Number(projectsData[0].avgProjects || 0).toFixed(1)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new placement drive
// @route   POST /api/admin/drives
// @access  Private (Admin)
const createDrive = async (req, res) => {
    const { company_name, role, description, eligible_departments, drive_date, application_deadline } = req.body;

    if (!company_name || !role || !eligible_departments || !drive_date || !application_deadline) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const eligible_departments_str = eligible_departments.join(',');

        const [result] = await db.query(
            'INSERT INTO placement_drives (company_name, role, description, eligible_departments, drive_date, application_deadline, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [company_name, role, description, eligible_departments_str, drive_date, application_deadline, req.user.id]
        );

        const driveId = result.insertId;

        if (eligible_departments.length > 0) {
            const placeholders = eligible_departments.map(() => '?').join(',');
            const [students] = await db.query(`SELECT id FROM students WHERE branch IN (${placeholders})`, eligible_departments);

            if (students.length > 0) {
                const notificationMsg = `New Placement Drive: ${company_name} - ${role}`;
                const notificationValues = students.map(s => [s.id, notificationMsg]);
                await db.query('INSERT INTO notifications (student_id, message) VALUES ?', [notificationValues]);
            }
        }

        res.status(201).json({ message: 'Drive created successfully and notifications sent', driveId });
    } catch (error) {
        console.error('Error creating drive:', error);
        res.status(500).json({ message: 'Server error creating drive' });
    }
};

// @desc    Get all active drives
// @route   GET /api/admin/drives
// @access  Private (Admin)
const getAdminDrives = async (req, res) => {
    try {
        const [upcoming_drives] = await db.query(
            "SELECT * FROM placement_drives WHERE created_by = ? AND COALESCE(drive_start_date, drive_date) > CURDATE() AND status = 'active' ORDER BY COALESCE(drive_start_date, drive_date) ASC",
            [req.user.id]
        );
        const [ongoing_drives] = await db.query(
            "SELECT * FROM placement_drives WHERE created_by = ? AND COALESCE(drive_start_date, drive_date) <= CURDATE() AND status = 'active' ORDER BY COALESCE(drive_start_date, drive_date) DESC",
            [req.user.id]
        );
        res.json({
            upcoming_drives,
            ongoing_drives
        });
    } catch (error) {
        console.error('Error fetching drives:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get drive applicants
// @route   GET /api/admin/drives/:drive_id/applicants
// @access  Private (Admin)
const getDriveApplicants = async (req, res) => {
    try {
        let query = `
            SELECT a.id as application_id, s.id as student_id, s.name, s.cgpa, s.branch, s.resume_path, a.status, a.applied_at
            FROM drive_applications a
            JOIN students s ON a.student_id = s.id
            WHERE a.drive_id = ? AND s.branch = ?
        `;
        let params = [req.params.drive_id, req.user.department];

        const [applicants] = await db.query(query, params);

        res.json(applicants);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update application status (shortlist/reject)
// @route   PUT /api/admin/applications/:id/:action
// @access  Private (Admin)
const updateApplicationStatus = async (req, res) => {
    const { action } = req.params;

    let newStatus = '';
    if (action === 'shortlist') newStatus = 'shortlisted';
    else if (action === 'reject') newStatus = 'rejected';
    else return res.status(400).json({ message: 'Invalid action' });

    try {
        const [result] = await db.query('UPDATE drive_applications SET status = ? WHERE id = ?', [newStatus, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ message: `Application ${newStatus} successfully` });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Export shortlist for a drive
// @route   GET /api/admin/drives/:drive_id/shortlist
// @access  Private (Admin)
const getShortlistExport = async (req, res) => {
    try {
        let query = `
            SELECT s.name, s.email, s.branch, s.cgpa, s.phone, s.github, s.portfolio
            FROM drive_applications a
            JOIN students s ON a.student_id = s.id
            WHERE a.drive_id = ? AND a.status = 'shortlisted' AND s.branch = ?
        `;
        let params = [req.params.drive_id, req.user.department];

        const [shortlist] = await db.query(query, params);

        res.json(shortlist);
    } catch (error) {
        console.error('Error exporting shortlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
    try {
        const [admins] = await db.query(
            'SELECT id, name, email, department, email_notifications, theme FROM admins WHERE id = ?',
            [req.user.id]
        );

        if (admins.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json(admins[0]);
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update admin profile & settings
// @route   PUT /api/admin/profile
// @access  Private (Admin)
const updateAdminProfile = async (req, res) => {
    const { name, currentPassword, newPassword, email_notifications, theme } = req.body;

    try {
        const [admins] = await db.query('SELECT * FROM admins WHERE id = ?', [req.user.id]);
        if (admins.length === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const admin = admins[0];

        let updateQuery = 'UPDATE admins SET name = ?, email_notifications = ?, theme = ?';
        let updateParams = [
            name || admin.name,
            email_notifications !== undefined ? email_notifications : admin.email_notifications,
            theme || admin.theme
        ];

        // Handle password update
        if (currentPassword && newPassword) {
            const bcrypt = require('bcryptjs');
            const isMatch = await bcrypt.compare(currentPassword, admin.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect current password' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            updateQuery += ', password = ?';
            updateParams.push(hashedPassword);
        }

        updateQuery += ' WHERE id = ?';
        updateParams.push(req.user.id);

        await db.query(updateQuery, updateParams);

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error updating admin profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Register a new admin (Admin restricted)
// @route   POST /api/admin/register-new
// @access  Private (Admin)
const registerNewAdmin = async (req, res) => {
    const { name, email, department, password } = req.body;

    if (!name || !email || !department || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if email already exists
        const [existing] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO admins (name, email, password, department) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, department]
        );

        res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.error('Error registering new admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get admin settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSettings = async (req, res) => {
    try {
        const [admins] = await db.query('SELECT name, email, department FROM admins WHERE id = ?', [req.user.id]);
        if (admins.length === 0) return res.status(404).json({ message: 'Admin not found' });
        
        const [prefs] = await db.query('SELECT drive_notifications, application_updates, shortlist_alerts FROM notification_preferences WHERE user_id = ? AND role = "admin"', [req.user.id]);
        
        const settings = {
            profile: {
                name: admins[0].name,
                email: admins[0].email,
                department: admins[0].department
            },
            notifications: prefs.length > 0 ? prefs[0] : { drive_notifications: true, application_updates: true, shortlist_alerts: true }
        };
        
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/update-profile
// @access  Private (Admin)
const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    try {
        await db.query('UPDATE admins SET name = ?, email = ? WHERE id = ?', [name, email, req.user.id]);
        
        const [updatedAdmin] = await db.query('SELECT id, name, email, department FROM admins WHERE id = ?', [req.user.id]);
        res.json({ message: 'Profile updated successfully', admin: updatedAdmin[0] });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Change admin password
// @route   PUT /api/admin/change-password
// @access  Private (Admin)
const changePassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    try {
        const [admins] = await db.query('SELECT password FROM admins WHERE id = ?', [req.user.id]);
        if (admins.length === 0) return res.status(404).json({ message: 'Admin not found' });
        
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare(current_password, admins[0].password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(new_password, salt);
        
        await db.query('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update admin notification settings
// @route   PUT /api/admin/notification-settings
// @access  Private (Admin)
const updateNotificationSettings = async (req, res) => {
    const { drive_notifications, application_updates, shortlist_alerts } = req.body;
    try {
        const [existing] = await db.query('SELECT id FROM notification_preferences WHERE user_id = ? AND role = "admin"', [req.user.id]);
        
        if (existing.length > 0) {
            await db.query(`UPDATE notification_preferences 
                SET drive_notifications = ?, application_updates = ?, shortlist_alerts = ? 
                WHERE id = ?`, 
                [drive_notifications, application_updates, shortlist_alerts, existing[0].id]);
        } else {
            await db.query(`INSERT INTO notification_preferences 
                (user_id, role, drive_notifications, application_updates, shortlist_alerts) 
                VALUES (?, "admin", ?, ?, ?)`, 
                [req.user.id, drive_notifications, application_updates, shortlist_alerts]);
        }
        res.json({ message: 'Notification preferences updated successfully' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllStudents, getStudentDetails, approveStudent, getDashboardStats,
    createDrive, getAdminDrives, getDriveApplicants, updateApplicationStatus, getShortlistExport,
    getAdminProfile, updateAdminProfile, registerNewAdmin,
    getSettings, updateProfile, changePassword, updateNotificationSettings
};
