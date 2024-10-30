const express = require("express")
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const { getAllSchedule, rejectSchedule, acceptSchedule } = require("../controller/scheduleController");

const router = express.Router();



router.get('/', getAllSchedule);
router.post('/reject', rejectSchedule);
router.post('/accept', acceptSchedule);

module.exports = router