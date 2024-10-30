const express = require("express")
const { updateStudentProfile, loginStudentCtrl, logoutStudent } = require('../controller/studentController')
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();



router.get('/logout', logoutStudent);
router.post('/sign-in', loginStudentCtrl);
router.patch('/update/:uniqueId', updateStudentProfile);

module.exports = router