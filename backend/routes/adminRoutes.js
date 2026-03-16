const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllStudents, getStudentDetails, approveStudent, getDashboardStats,
    createDrive, getAdminDrives, getDriveApplicants, updateApplicationStatus, getShortlistExport,
    getAdminProfile, updateAdminProfile, registerNewAdmin,
    getSettings, updateProfile, changePassword, updateNotificationSettings
} = require('../controllers/adminController');

router.get('/students', protect, admin, getAllStudents);
router.get('/student/:id', protect, admin, getStudentDetails);
router.put('/student/:id/approve', protect, admin, approveStudent);
router.get('/dashboard-stats', protect, admin, getDashboardStats);

router.get('/profile', protect, admin, getAdminProfile);
router.put('/profile', protect, admin, updateAdminProfile);
router.post('/register-new', protect, admin, registerNewAdmin);

// Placement Drive Management
router.post('/drives', protect, admin, createDrive);
router.get('/drives', protect, admin, getAdminDrives);
router.get('/drives/:drive_id/applicants', protect, admin, getDriveApplicants);
router.put('/applications/:id/:action', protect, admin, updateApplicationStatus);
router.get('/drives/:drive_id/shortlist', protect, admin, getShortlistExport);

// Settings
router.get('/settings', protect, admin, getSettings);
router.put('/update-profile', protect, admin, updateProfile);
router.put('/change-password', protect, admin, changePassword);
router.put('/notification-settings', protect, admin, updateNotificationSettings);

module.exports = router;
