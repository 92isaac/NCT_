const express = require("express")
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const { getAllRoom } = require("../controller/roomController");
const router = express.Router();



router.get('/', getAllRoom);

module.exports = router