const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (id, role, department = null) => {
    return jwt.sign({ id, role, department }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new student
// @route   POST /api/auth/student/register
// @access  Public
const registerStudent = async (req, res) => {
    const { name, roll_no, email, password, branch } = req.body;

    const ALLOWED_BRANCHES = ['DS', 'IT', 'AIML', 'CS-Cybersecurity', 'CSE'];
    if (!ALLOWED_BRANCHES.includes(branch)) {
        return res.status(400).json({ message: 'Invalid branch selected' });
    }

    try {
        const [existingStudent] = await db.query(
            'SELECT * FROM students WHERE email = ? OR roll_no = ?',
            [email, roll_no]
        );

        if (existingStudent.length > 0) {
            return res.status(400).json({ message: 'Student already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO students (name, roll_no, email, password, branch) VALUES (?, ?, ?, ?, ?)',
            [name, roll_no, email, hashedPassword, branch]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role: 'student',
            token: generateToken(result.insertId, 'student'),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Login student
// @route   POST /api/auth/student/login
// @access  Public
const loginStudent = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [students] = await db.query('SELECT * FROM students WHERE email = ?', [email]);
        const student = students[0];

        if (student && (await bcrypt.compare(password, student.password))) {
            res.json({
                id: student.id,
                name: student.name,
                email: student.email,
                role: 'student',
                token: generateToken(student.id, 'student'),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [admins] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        const admin = admins[0];

        if (admin && (await bcrypt.compare(password, admin.password))) {
            res.json({
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: 'admin',
                department: admin.department,
                token: generateToken(admin.id, 'admin', admin.department),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { registerStudent, loginStudent, loginAdmin };
