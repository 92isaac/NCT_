const express = require("express")
const { isAdmin, authMiddleware, authorize } = require("../middleware/authMiddleware");
const { getAllRoom, getSingleRoom, updateRoom } = require("../controller/roomController");
const router = express.Router();



router.get('/', getAllRoom);
router.get('/update',authorize("Admin"), updateRoom);
router.get('/single/:uniqueId', getSingleRoom);

module.exports = router