const express = require("express")
const multer = require('multer');

const { updateStudentProfile, loginStudentCtrl, logoutStudent, getStudentProfile, uploadStudentImage } = require('../controller/studentController')
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/logout', logoutStudent);
router.get('/profile', getStudentProfile);
router.post('/sign-in', loginStudentCtrl);
router.patch('/update/:uniqueId', updateStudentProfile);
router.patch('/upload/:uniqueId', upload.single('image'), uploadStudentImage);

module.exports = router