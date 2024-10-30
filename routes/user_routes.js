const express = require("express")
const { getAllUsers, getAllStudentOnly, getAllInstructorstOnly, getSingleUser, deleteUser, createUser, updateUser, loginUserCtrl, logoutUser, getAllInstructorstDetailsOnly, createInstructor } = require('../controller/userController');
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();


router.get('/', getAllUsers)
router.get('/logout', logoutUser)
router.post('/', isAdmin, createUser)
router.post('/create-instructor', createInstructor)
router.post('/sign-in', loginUserCtrl)
router.get('/students', getAllStudentOnly)
router.get('/instructors', getAllInstructorstOnly)
router.get('/instructors_details', getAllInstructorstDetailsOnly)
router.get('/single/:uniqueId', authMiddleware, getSingleUser)
router.patch('/update/:uniqueId',isAdmin, authMiddleware, updateUser)
router.delete('/delete/:uniqueId', deleteUser)

module.exports = router