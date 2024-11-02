const asyncHandler = require('express-async-handler')
const { sql } = require('../config/db')
const { formatResponse } = require('../utils/responseFormatter')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { generateRefreshToken, generateToken } = require('../config/generateToken');
const { token } = require('morgan');

const getAllAdmin = asyncHandler(async(req, res)=>{
    const q = 'SELECT * FROM Admin'
    try{
        const result = await sql.query(q)
        res.json(formatResponse(result))

    }catch(e){
        res.status(500).json({
            error: "Internal Server Error",
            details:e.message
        });
        throw new Error(e)
    }
})
const getAllInstructor = asyncHandler(async(req, res)=>{
    const q = 'SELECT * FROM Instructor'
    try{
        const result = await sql.query(q)
        res.json(formatResponse(result))

    }catch(e){
        res.status(500).json({
            error: "Internal Server Error",
            details:e.message
        });
        throw new Error(e)
    }
})
const getAllSchedule = asyncHandler(async(req, res)=>{
    const q = 'SELECT * FROM Schedule'
    try{
        const result = await sql.query(q)
        res.json(formatResponse(result))

    }catch(e){
        res.status(500).json({
            error: "Internal Server Error",
            details:e.message
        });
        throw new Error(e)
    }
})
const getAllStudent = asyncHandler(async(req, res)=>{
    const q = 'SELECT * FROM Student'
    try{
        const result = await sql.query(q)
        res.json(formatResponse(result))

    }catch(e){
        res.status(500).json({
            error: "Internal Server Error",
            details:e.message
        });
        throw new Error(e)
    }
})

const getAllRoom = asyncHandler(async(req, res)=>{
    const q = 'SELECT * FROM Room'
    try{
        const result = await sql.query(q)
        res.json(formatResponse(result))

    }catch(e){
        res.status(500).json({
            error: "Internal Server Error",
            details:e.message
        });
        throw new Error(e)
    }
})



const getAllSuperAdmin = asyncHandler(async(req, res)=>{
    const q = "SELECT * FROM Admin WHERE role = 'SuperAdmin'";
    try{
        const result = await sql.query(q);
        res.json(formatResponse(result))
    }catch(err){
        res.status(500).json({
            erro: "Internal Server Error",
            details: err.message
        })
        throw new Error(err)
    }
})

const getAllOtherAdmin = asyncHandler(async(req, res)=>{
    const q = "SELECT * FROM Admin WHERE role = 'Admin'";
    try{
        const result = await sql.query(q);
        res.json(formatResponse(result))
    }catch(err){
        res.status(500).json({
            erro: "Internal Server Error",
            details: err.message
        })
        throw new Error(err)
    }
})


const getSingleAdmin = asyncHandler(async (req, res) =>{
    const uniqueId = req.params.uniqueId;
    const q = 'SELECT * FROM Admin WHERE uniqueId = @uniqueId';
    console.log(uniqueId)
    console.log(q)
    try{
        const pool = await sql.connect();
        const request = pool.request();
        request.input("uniqueId", sql.UniqueIdentifier, uniqueId)
        const result = await request.query(q)
        if(result.recordset.length === 0){
            return res.status(404).json({
                message:"User not found or does not exist",
                data: []
            })
        }
        res.json(formatResponse(result))

    }catch(err){
        res.status(500).json({
            error: "Internal server errort",
            details: err.message
        })
    }
})
const getSingleInstructor = asyncHandler(async (req, res) =>{
    const uniqueId = req.params.uniqueId;
    const q = 'SELECT * FROM Instructor WHERE uniqueId = @uniqueId';
    console.log(uniqueId)
    console.log(q)
    try{
        const pool = await sql.connect();
        const request = pool.request();
        request.input("uniqueId", sql.UniqueIdentifier, uniqueId)
        const result = await request.query(q)
        if(result.recordset.length === 0){
            return res.status(404).json({
                message:"User not found or does not exist",
                data: []
            })
        }
        res.json(formatResponse(result))

    }catch(err){
        res.status(500).json({
            error: "Internal server errort",
            details: err.message
        })
    }
})


const getInstructorSchedule = asyncHandler(async(req, res)=>{
    const { instructorId } = req.params;

    try {
      const pool = await sql.connect();
      const query = `
        SELECT 
          s.uniqueId AS ScheduleId,
          s.Course,
          s.Campus,
          s.Date,
          s.StartTime,
          s.EndTime,
          s.Status,
          r.RoomNo AS RoomNumber,
          i.FirstName,
          i.LastName
        FROM 
          Schedule s
        JOIN 
          Instructor i ON s.InstructorId = i.uniqueId
        JOIN 
          Room r ON s.RoomId = r.uniqueId
        WHERE 
          s.InstructorId = @InstructorId;
      `;
      const request = pool.request();
      request.input('InstructorId', sql.UniqueIdentifier, instructorId);
      
      const result = await request.query(query);
      res.json(result.recordset);  // Return schedules assigned to the instructor
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve schedules", details: err.message });
    }
})

const deleteUser = asyncHandler(async (req, res) => {
    const { uniqueId } = req.params;
    console.log(uniqueId);

    const deleteUserQuery = 'DELETE FROM Admin WHERE uniqueId = @uniqueId';
  // 1E7A693E-D716-4A9B-9090-3F42FA0A5BC5

    try {
        const pool = await sql.connect();
        const request = pool.request();

        // Check if the user exists
        request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
        const result = await request.query(deleteUserQuery);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
});


const deleteInstructor = asyncHandler(async (req, res) => {
  const { uniqueId } = req.params;
  console.log(uniqueId);

  const deleteUserQuery = 'DELETE FROM Instructor WHERE uniqueId = @uniqueId';
// 1E7A693E-D716-4A9B-9090-3F42FA0A5BC5

  try {
      const pool = await sql.connect();
      const request = pool.request();

      // Check if the user exists
      request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
      const result = await request.query(deleteUserQuery);
      
      if (result.rowsAffected[0] === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: 'Instructor deleted successfully' });
  } catch (err) {
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});


const deleteStudent = asyncHandler(async (req, res) => {
  const { uniqueId } = req.params;
  console.log(uniqueId);

  const deleteUserQuery = 'DELETE FROM Student WHERE uniqueId = @uniqueId';
// 1E7A693E-D716-4A9B-9090-3F42FA0A5BC5

  try {
      const pool = await sql.connect();
      const request = pool.request();

      // Check if the user exists
      request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
      const result = await request.query(deleteUserQuery);
      
      if (result.rowsAffected[0] === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});


const deleteSchedule = asyncHandler(async (req, res) => {
  const { uniqueId } = req.params;
  console.log(uniqueId);

  const deleteUserQuery = 'DELETE FROM Schedule WHERE uniqueId = @uniqueId';


  try {
      const pool = await sql.connect();
      const request = pool.request();

      request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
      const result = await request.query(deleteUserQuery);
      
      if (result.rowsAffected[0] === 0) {
          return res.status(404).json({ message: "Schedule not found" });
      }
      res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (err) {
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});


const createAdmin = asyncHandler(async (req, res) => {
  const uniqueId = uuidv4();  
  const { FirstName, LastName, Email, PhoneNumber, Password, role, image } = req.body;

  const q = `
      INSERT INTO Admin (uniqueId, FirstName, LastName, Email, PhoneNumber, Password, role, image, Token)
      VALUES (@uniqueId, @FirstName, @LastName, @Email, @PhoneNumber, @Password, @role, @image, NULL)
  `; 

  try {
      const pool = await sql.connect();
      const request = pool.request();

      request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
      request.input('FirstName', sql.NVarChar, FirstName);
      request.input('LastName', sql.NVarChar, LastName);
      request.input('Email', sql.NVarChar, Email);
      request.input('PhoneNumber', sql.NVarChar, PhoneNumber);
      request.input('Password', sql.NVarChar, Password);
      request.input('role', sql.NVarChar, role);
      request.input('image', sql.NVarChar, image || null);

      await request.query(q);
   
      res.status(200).json({
          message: 'Admin created successfully',
          uniqueId
      });
  } catch (err) {
      // Handle errors
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});



const createInstructor = asyncHandler(async (req, res) => {
  const uniqueId = uuidv4();  
  const { FirstName, LastName, Email, PhoneNumber, Password, Education, Bio, Department, image, title } = req.body;

  const q = `
      INSERT INTO Instructor (uniqueId, FirstName, LastName, Email, PhoneNumber, Password,  Education, Bio, Department, image, title, Token)
      VALUES (@uniqueId, @FirstName, @LastName, @Email, @PhoneNumber, @Password, @Education, @Bio, @Department, @image, @title, NULL)
  `; 

  try {
      const pool = await sql.connect();
      const request = pool.request();

      request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
      request.input('FirstName', sql.NVarChar, FirstName);
      request.input('LastName', sql.NVarChar, LastName);
      request.input('Email', sql.NVarChar, Email);
      request.input('PhoneNumber', sql.NVarChar, PhoneNumber);
      request.input('Password', sql.NVarChar, Password);
      request.input('Education', sql.NVarChar, Education);
      request.input('Bio', sql.NVarChar, Bio);
      request.input('Department', sql.NVarChar, Department);
      // request.input('role', sql.NVarChar, role);
      request.input('image', sql.NVarChar, image || null);
      request.input('title', sql.NVarChar, title);

      await request.query(q);
   
      res.status(200).json({
          message: 'Instructor created successfully',
          status: 200,
          uniqueId
      });
  } catch (err) {
      // Handle errors
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});



const createStudent = asyncHandler(async (req, res) => {
  const uniqueId = uuidv4();  
  const { FirstName, LastName, Email, PhoneNumber, Password, CourseOfStudy, image, } = req.body;

  const q = `
      INSERT INTO Student (uniqueId, FirstName, LastName, Email, PhoneNumber, Password,  CourseOfStudy, image, Token)
      VALUES (@uniqueId, @FirstName, @LastName, @Email, @PhoneNumber, @Password, @CourseOfStudy, @image, NULL)
  `; 

  try {
      const pool = await sql.connect();
      const request = pool.request();

      request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
      request.input('FirstName', sql.NVarChar, FirstName);
      request.input('LastName', sql.NVarChar, LastName);
      request.input('Email', sql.NVarChar, Email);
      request.input('PhoneNumber', sql.NVarChar, PhoneNumber);
      request.input('Password', sql.NVarChar, Password);
      request.input('CourseOfStudy', sql.NVarChar, CourseOfStudy);
      request.input('image', sql.NVarChar, image || null);
     ;

      await request.query(q);
   
      res.status(200).json({
          message: 'Student created successfully',
          uniqueId
      });
  } catch (err) {
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});



const createSchedule = asyncHandler(async (req, res) => {
  const uniqueId = uuidv4();  
  const { InstructorId, RoomId, Course, Campus, Date, StartTime, EndTime } = req.body;



  try {
      const pool = await sql.connect();
      const roomCheckQuery = `
            SELECT * FROM Schedule
            WHERE RoomId = @RoomId AND Date = @Date 
            AND @EndTime > StartTime AND @StartTime < EndTime;
        `;
      const roomCheckRequest = pool.request();

    //   request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
    roomCheckRequest.input('RoomId', sql.UniqueIdentifier, RoomId);
    roomCheckRequest.input('Date', sql.Date, Date);
    roomCheckRequest.input('StartTime', sql.Time, StartTime);
    roomCheckRequest.input('EndTime', sql.Time, EndTime);
    
      const roomCheckResult = await roomCheckRequest.query(roomCheckQuery);
      if(roomCheckResult.recordset.length > 0){
        res.status(400).json({
            message: 'Room is not available',
        });
      }

      const instructorCheckQuery = `
            SELECT * FROM Schedule
            WHERE InstructorId = @InstructorId AND Date = @Date 
            AND @EndTime > StartTime AND @StartTime < EndTime;
        `;

        const instructorCheckRequest = pool.request();

        //   request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
        instructorCheckRequest.input('InstructorId', sql.UniqueIdentifier, InstructorId);
        instructorCheckRequest.input('Date', sql.Date, Date);
        instructorCheckRequest.input('StartTime', sql.Time, StartTime);
        instructorCheckRequest.input('EndTime', sql.Time, EndTime);
        
          const instructorCheckResult = await instructorCheckRequest.query(instructorCheckQuery);
          if(instructorCheckResult.recordset.length > 0){
            res.status(400).json({
                message: 'Instructor is already booked',
            });
          }

          const createScheduleQuery = `
            INSERT INTO Schedule (InstructorId, RoomId, Course, Campus, Date, StartTime, EndTime, Status)
            VALUES (@InstructorId, @RoomId, @Course, @Campus, @Date, @StartTime, @EndTime, 'Pending')
        `;

        const creatScheduleRequest = pool.request();
        creatScheduleRequest.input('InstructorId', sql.UniqueIdentifier, InstructorId);
        creatScheduleRequest.input('RoomId', sql.UniqueIdentifier, RoomId);
        creatScheduleRequest.input('Course', sql.NVarChar, Course);
        creatScheduleRequest.input('Campus', sql.NVarChar, Campus);
        creatScheduleRequest.input('Date', sql.Date, Date);
        creatScheduleRequest.input('StartTime', sql.Time, StartTime);
        creatScheduleRequest.input('EndTime', sql.Time, EndTime);

        await creatScheduleRequest.query(createScheduleQuery)

      res.status(200).json({
          message: 'Schedule created successfully',
          uniqueId
      });
  } catch (err) {
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});


const updateAdmin = asyncHandler(async (req, res) => {
  const { uniqueId } = req.params;  
  const { firstname, lastname, phonenumber, password, image } = req.body;  

  const q = `
      UPDATE Admin 
      SET FirstName = @FirstName, LastName = @LastName, PhoneNumber = @PhoneNumber, Password = @Password, image = @Image
      WHERE uniqueId = @UniqueId
  `;

  try {
      const pool = await sql.connect(); 
      const request = pool.request();

      request.input('UniqueId', sql.UniqueIdentifier, uniqueId);
      request.input('FirstName', sql.NVarChar, firstname);
      request.input('LastName', sql.NVarChar, lastname);
      request.input('PhoneNumber', sql.NVarChar, phonenumber);
      request.input('Password', sql.NVarChar, password);
      request.input('Image', sql.NVarChar, image || null);

      await request.query(q);

      res.status(200).json({
          message: 'Admin updated successfully',
          uniqueId
      });
  } catch (err) {
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});


const loginUserCtrl = asyncHandler(async (req, res)=>{
    const { Email, Password } = req.body;
    console.log(Email, Password)
    try{
        const pool = await sql.connect()
        const result = await pool.request()
        .input('Email', sql.NVarChar, Email)
        .query('SELECT * FROM Admin WHERE Email = @Email')

        const findUser = result.recordset[0];
        console.log(findUser)
        console.log(findUser.Password)

        if(!findUser){
            throw new Error("Invalid credentials")
        }
        const isPassword = Password === findUser.Password
        console.log(isPassword)
        if(!isPassword){
            throw new Error("Invalid credentials")
        }

            const Token = await generateRefreshToken(findUser.uniqueId)
            await pool.request()
            .input('Token', sql.NVarChar, Token)
            .input('uniqueId', sql.UniqueIdentifier, findUser.uniqueId)
            .query("UPDATE Admin SET Token = @Token WHERE uniqueId = @uniqueId")
            res.cookie('Token', Token, {
                httpOnly: true,
                maxAge : 48 * 60 * 60 * 1000
            });
            res.status(200).json({
                uniqueId:findUser.uniqueId,
                FirstName: findUser.FirstName,
                LastName: findUser.LastName,
                Email: findUser.Email,
                image: findUser.image,
                role: findUser.role,
                userType: 'Admin',
                Token: generateToken(findUser.uniqueId)
            })

    }catch(err){
        res.status(500).json({
            error: err,
            details: err.message
        })
    }
})

const logoutUser = asyncHandler(async(req, res)=>{
    const { Token } = req.cookies
    if(!Token){
        return res.status(400).json({
            message: "User is not logged in"
        })
    }

    try{
        const pool = await sql.connect();
        const result = await pool.request()
        .input("refreshToken", sql.NVarChar, Token)
        .query("SELECT * FROM Admin WHERE Token = @Token");
        
        const findUser = result.recordset[0];

        if(!findUser){
            return res.status(400).json({
                message: "User not found or already logged out"
            })
        }

        await pool.request()
        .input("uniqueId", sql.UniqueIdentifier, findUser.uniqueId)
        .query("UPDATE Admin SET Token = NULL WHERE uniqueId = @uniqueId")

        res.clearCookie("Token", {
            httpOnly:true,
            secure:true
        })
        res.status(200).json({
            message : "User logged out successfully"
        })
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

module.exports = {
    getAllAdmin,
    getAllSuperAdmin,
    getAllOtherAdmin,
    getSingleAdmin,
    deleteUser,
    deleteInstructor,
    deleteStudent,
    createAdmin,
    updateAdmin,
    loginUserCtrl, 
    logoutUser,
    createInstructor,
    createStudent,
    getAllInstructor,
    getAllRoom,
    getAllSchedule,
    getAllStudent,
    getSingleInstructor,
    createSchedule,
    deleteSchedule,
    getInstructorSchedule
}
