const express = require("express")
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
// const { getAllSchedule, rejectSchedule, acceptSchedule } = require("../controller/scheduleController");
const { updateInstructorProfile, loginInstructorCtrl } = require("../controller/instructorController");

const router = express.Router();



router.get('/', updateInstructorProfile);
router.post('/sign-in', loginInstructorCtrl);
// router.post('/accept', acceptSchedule);

module.exports = router