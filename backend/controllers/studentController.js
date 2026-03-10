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
    const { name, phone, cgpa, backlogs, github, portfolio, internship_details, branch } = req.body;

    const ALLOWED_BRANCHES = ['DS', 'IT', 'AIML', 'CS-Cybersecurity', 'CSE'];
    if (branch && !ALLOWED_BRANCHES.includes(branch)) {
        return res.status(400).json({ message: 'Invalid branch selected' });
    }

    // Convert backlogs to boolean/int 0/1
    const backlogsVal = backlogs ? 1 : 0;

    try {
        await db.query(
            'UPDATE students SET name = ?, phone = ?, cgpa = ?, backlogs = ?, github = ?, portfolio = ?, internship_details = ?, branch = ? WHERE id = ?',
            [name, phone, cgpa, backlogsVal, github, portfolio, internship_details, branch, req.user.id]
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

        const [drives] = await db.query(
            "SELECT * FROM placement_drives WHERE eligible_departments LIKE ? AND status = 'active' ORDER BY drive_date ASC",
            [`%${branch}%`]
        );
        res.json(drives);
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

module.exports = {
    getProfile, updateProfile, getSkills, addSkill, deleteSkill, getProjects, addProject, deleteProject, uploadResume,
    getEligibleDrives, applyForDrive, getStudentApplications
};
