const express = require('express');
const router = express.Router();
const { registerStudent, loginStudent, loginAdmin } = require('../controllers/authController');

router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);
router.post('/admin/login', loginAdmin);

module.exports = router;
