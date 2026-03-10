const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getAllStudents, getStudentDetails, approveStudent, getDashboardStats, addNewAdmin,
    createDrive, getAdminDrives, getDriveApplicants, updateApplicationStatus, getShortlistExport
} = require('../controllers/adminController');

router.get('/students', protect, admin, getAllStudents);
router.get('/student/:id', protect, admin, getStudentDetails);
router.put('/student/:id/approve', protect, admin, approveStudent);
router.get('/dashboard-stats', protect, admin, getDashboardStats);
router.post('/add-new', protect, admin, addNewAdmin);

// Placement Drive Management
router.post('/drives', protect, admin, createDrive);
router.get('/drives', protect, admin, getAdminDrives);
router.get('/drives/:drive_id/applicants', protect, admin, getDriveApplicants);
router.put('/applications/:id/:action', protect, admin, updateApplicationStatus);
router.get('/drives/:drive_id/shortlist', protect, admin, getShortlistExport);

module.exports = router;
