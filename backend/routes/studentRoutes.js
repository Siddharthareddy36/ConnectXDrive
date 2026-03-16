const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
    getProfile, updateProfile, getSkills, addSkill, deleteSkill, getProjects, addProject, deleteProject, uploadResume,
    getEligibleDrives, applyForDrive, getStudentApplications,
    getSettings, updateAccount, updateLinks, changePassword, updateNotificationSettings
} = require('../controllers/studentController');

// Multer setup
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only .pdf files are allowed!'));
        }
    }
});

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/skills', protect, getSkills);
router.post('/skills', protect, addSkill);
router.delete('/skills/:id', protect, deleteSkill);
router.get('/projects', protect, getProjects);
router.post('/projects', protect, addProject);
router.delete('/projects/:id', protect, deleteProject);

// Wrapper for uploadResume to handle multer errors properly
router.post('/resume', protect, (req, res, next) => {
    const uploadSingle = upload.single('resume');
    uploadSingle(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            // An unknown error occurre when uploading.
            return res.status(400).json({ message: err.message });
        }
        // Everything went fine.
        next();
    });
}, uploadResume);

// Placement Drives
router.get('/drives', protect, getEligibleDrives);
router.post('/drives/apply', protect, applyForDrive);
router.get('/applications', protect, getStudentApplications);

// Settings
router.get('/settings', protect, getSettings);
router.put('/update-account', protect, updateAccount);
router.put('/update-links', protect, updateLinks);
router.put('/change-password', protect, changePassword);
router.put('/notification-settings', protect, updateNotificationSettings);

module.exports = router;
