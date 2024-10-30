const express = require("express")
const { getAllAdmin, getAllSuperAdmin, getAllOtherAdmin, getSingleAdmin, deleteUser, updateAdmin, loginUserCtrl, logoutUser, createAdmin, createInstructor, createStudent, deleteInstructor, deleteStudent, getAllInstructor, getAllRoom, getAllStudent, getAllSchedule, getSingleInstructor, createSchedule, deleteSchedule, getInstructorSchedule } = require('../controller/adminController')
const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();


router.get('/', getAllAdmin);
router.get('/super-admin', getAllSuperAdmin);
router.get('/other-admin', getAllOtherAdmin);
router.get('/all-instructor', getAllInstructor);
router.get('/all-room', getAllRoom);
router.get('/all-student', getAllStudent);
router.get('/all-schedule', getAllSchedule);
router.get('/instructor-schedule/:instructorId', getInstructorSchedule);
router.get('/logout', logoutUser);
router.post('/create-admin', createAdmin);
router.post('/create-instructor', createInstructor);
router.post('/create-student', createStudent);
router.post('/create-schedule', createSchedule);
router.post('/sign-in', loginUserCtrl);
router.get('/single/:uniqueId', getSingleAdmin);
router.get('/single-instructor/:uniqueId', getSingleInstructor);
router.patch('/update/:uniqueId', updateAdmin);
router.delete('/delete/:uniqueId', deleteUser);
router.delete('/delete-instructor/:uniqueId', deleteInstructor);
router.delete('/delete-student/:uniqueId', deleteStudent);
router.delete('/delete-schedule/:uniqueId', deleteSchedule);

module.exports = router