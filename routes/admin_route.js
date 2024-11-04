const express = require("express")
const multer = require('multer');
const { getAllAdmin, getAllSuperAdmin, getAllOtherAdmin, getSingleAdmin, deleteUser, updateAdmin, loginUserCtrl, logoutUser, createAdmin, createInstructor, createStudent, deleteInstructor, deleteStudent, getAllInstructor, getAllRoom, getAllStudent, getAllSchedule, getSingleInstructor, createSchedule, deleteSchedule, getInstructorSchedule, uploadExcel, updateSchedule, getSingleSchedule } = require('../controller/adminController')
// const { isAdmin, authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();
const upload = multer();


router.get('/', getAllAdmin);
router.get('/super-admin', getAllSuperAdmin);
router.get('/other-admin', getAllOtherAdmin);
router.get('/all-instructor', getAllInstructor);
router.get('/all-room', getAllRoom);
router.get('/all-student', getAllStudent);
router.get('/all-schedule', getAllSchedule);
router.get('/instructor-schedule/:instructorId', getInstructorSchedule);
router.get('/logout', logoutUser);
router.get('/single/:uniqueId', getSingleAdmin);
router.get('/single-schedule/:uniqueId', getSingleSchedule);
router.get('/single-instructor/:uniqueId', getSingleInstructor);
router.post('/create-admin', createAdmin);
router.post('/create-instructor', createInstructor);
router.post('/create-student', createStudent);
router.post('/create-schedule', createSchedule);
router.post('/upload-schedule',  upload.single('file'), uploadExcel);
router.post('/sign-in', loginUserCtrl);
router.patch('/update/:uniqueId', updateAdmin);
router.patch('/update-schedule/:uniqueId', updateSchedule);
router.delete('/delete/:uniqueId', deleteUser);
router.delete('/delete-instructor/:uniqueId', deleteInstructor);
router.delete('/delete-student/:uniqueId', deleteStudent);
router.delete('/delete-schedule/:uniqueId', deleteSchedule);

module.exports = router