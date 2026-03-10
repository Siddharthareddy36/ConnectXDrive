const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
    getProfile, updateProfile, getSkills, addSkill, deleteSkill, getProjects, addProject, deleteProject, uploadResume,
    getEligibleDrives, applyForDrive, getStudentApplications
} = require('../controllers/studentController');

// Multer setup
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'backend/uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: PDFs Only!');
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
router.post('/resume', protect, upload.single('resume'), uploadResume);

// Placement Drives
router.get('/drives', protect, getEligibleDrives);
router.post('/drives/apply', protect, applyForDrive);
router.get('/applications', protect, getStudentApplications);

module.exports = router;
