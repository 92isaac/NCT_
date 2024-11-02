const express = require("express")
const { updateStudentProfile, loginStudentCtrl, logoutStudent, getStudentProfile } = require('../controller/studentController')
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();



router.get('/logout', logoutStudent);
router.get('/profile', getStudentProfile);
router.post('/sign-in', loginStudentCtrl);
router.patch('/update/:uniqueId', updateStudentProfile);

module.exports = router