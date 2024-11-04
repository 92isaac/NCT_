const asyncHandler = require('express-async-handler')
const { sql } = require('../config/db')
const { formatResponse } = require('../utils/responseFormatter')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const xlsx = require('xlsx')
// const multer = require('multer')
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

// const uploadExcel = asyncHandler(async(req, res)=>{
//     try{
//         const fileBuffer = req.file.buffer;
//         const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
//         const worksheet = workbook.Sheets[workbook.SheetNames[0]]; 
//         const scheduleData = xlsx.utils.sheet_to_json(worksheet);
    
//         // Loop through each row of the parsed data and insert into the Schedule table
//         const pool = await sql.connect();
    
//         for (const row of scheduleData) {
//           await pool.request()
//             .input('InstructorId', sql.UniqueIdentifier, row.InstructorId)
//             .input('RoomId', sql.UniqueIdentifier, row.RoomId)
//             .input('Course', sql.NVarChar, row.Course)
//             .input('Campus', sql.NVarChar, row.Campus)
//             .input('Date', sql.Date, row.Date)
//             .input('StartTime', sql.Time, row.StartTime)
//             .input('EndTime', sql.Time, row.EndTime)
//             .input('Status', sql.NVarChar, row.Status || 'Pending') 
//             .query(`
//               INSERT INTO Schedule (InstructorId, RoomId, Course, Campus, Date, StartTime, EndTime, Status)
//               VALUES (@InstructorId, @RoomId, @Course, @Campus, @Date, @StartTime, @EndTime, @Status)
//             `);
//         }
    
//         res.status(200).json({ 
//             message: 'Schedule data uploaded successfully',
//             status:true,
//          });
        
//     }catch(err){
//         res.status(500).json({
//             error: "Internal Server Error",
//             details: err.message
//         })
//         throw new Error(err)
//     }
// })


// const uploadExcel = asyncHandler(async (req, res) => {
//     try {
//       const fileBuffer = req.file.buffer;
//       const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
//       const worksheet = workbook.Sheets[workbook.SheetNames[0]];
//       const scheduleData = xlsx.utils.sheet_to_json(worksheet);
  
//       const requiredColumns = ['InstructorId', 'RoomId', 'Course', 'Campus', 'Date', 'StartTime', 'EndTime'];
  

//       const dataColumns = Object.keys(scheduleData[0]);
//       for (const column of requiredColumns) {
//         if (!dataColumns.includes(column)) {
//           return res.status(400).json({ 
//             error: `Column '${column}' is missing in the Excel file.`,
//             status:false,
//             status_code:400,
//          });
//         }
//       }
  
//       const pool = await sql.connect();
  
//       for (const row of scheduleData) {
//         if (!row.InstructorId || !row.RoomId || !row.Course || !row.Campus || !row.StartTime || !row.EndTime) {
//           return res.status(400).json({ 
//             error: `Required field(s) missing in the row: ${JSON.stringify(row)}`,
//             status:false,
//             status_code:400,
            
//          });
//         }
  
   
//         const date = row.Date ? row.Date : new Date().toISOString().split('T')[0];
  
       
//         const duplicateCheck = await pool.request()
//           .input('InstructorId', sql.UniqueIdentifier, row.InstructorId)
//           .input('Date', sql.Date, date)
//           .query(`
//             SELECT 1 FROM Schedule WHERE InstructorId = @InstructorId AND Date = @Date
//           `);
  
//         if (duplicateCheck.recordset.length > 0) {
//           return res.status(409).json({ 
//             error: `Duplicate entry found for InstructorId ${row.InstructorId} on Date ${date}`,
//             status:false,
//             status_code:409,
//           });
//         }
  
//         await pool.request()
//           .input('uniqueId', sql.UniqueIdentifier, crypto.randomUUID()) 
//           .input('InstructorId', sql.UniqueIdentifier, row.InstructorId)
//           .input('RoomId', sql.UniqueIdentifier, row.RoomId)
//           .input('Course', sql.NVarChar, row.Course)
//           .input('Campus', sql.NVarChar, row.Campus)
//           .input('Date', sql.Date, date)
//           .input('StartTime', sql.Time, row.StartTime)
//           .input('EndTime', sql.Time, row.EndTime)
//           .input('Status', sql.NVarChar, row.Status || 'Pending') 
//           .query(`
//             INSERT INTO Schedule (uniqueId, InstructorId, RoomId, Course, Campus, Date, StartTime, EndTime, Status)
//             VALUES (@uniqueId, @InstructorId, @RoomId, @Course, @Campus, @Date, @StartTime, @EndTime, @Status)
//           `);
//       }
  
//       res.status(200).json({
//         message: 'Schedule data uploaded successfully',
//         status: true,
//         status_code:200,
//       });
  
//     } catch (err) {
//       res.status(500).json({
//         error: "Internal Server Error",
//         details: err.message
//       });
//       throw new Error(err);
//     }
//   });


const uploadExcel = asyncHandler(async (req, res) => {
    try {
      const fileBuffer = req.file.buffer;
      const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const scheduleData = xlsx.utils.sheet_to_json(worksheet);
  
      const requiredColumns = ['InstructorId', 'RoomId', 'Course', 'Campus', 'Date', 'StartTime', 'EndTime'];
      const dataColumns = Object.keys(scheduleData[0]);
      const errors = [];
  
      // Check for missing columns
      for (const column of requiredColumns) {
        if (!dataColumns.includes(column)) {
          errors.push(`Column '${column}' is missing in the Excel file.`);
        }
      }
  
      if (errors.length > 0) {
        return res.status(400).json({
          error: errors,
          status: false,
          status_code: 400,
        });
      }
  
      const pool = await sql.connect();
  
      for (const row of scheduleData) {
        if (!row.InstructorId || !row.RoomId || !row.Course || !row.Campus || !row.StartTime || !row.EndTime) {
          errors.push(`Required field(s) missing in the row: ${JSON.stringify(row)}`);
          continue;
        }
  
        // Validate and parse the date
        let date;
        try {
          date = new Date(row.Date);
          if (isNaN(date.getTime()) || date.getFullYear() < 1000 || date.getFullYear() > 9999) {
            throw new Error("Date out of range");
          }
          date = date.toISOString().split('T')[0];
        } catch {
          date = new Date().toISOString().split('T')[0]; // Default to today's date if invalid
          errors.push(`Invalid date for row: ${JSON.stringify(row)}, using default date: ${date}`);
          continue;
        }
  
        // Validate StartTime and EndTime (must be in HH:MM:SS format)
        const validateTime = (time) => /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time);
        if (!validateTime(row.StartTime) || !validateTime(row.EndTime)) {
          errors.push(`Invalid time format for row: ${JSON.stringify(row)}. Expected format HH:MM:SS.`);
          continue;
        }
  
        // Duplicate check
        const duplicateCheck = await pool.request()
          .input('InstructorId', sql.UniqueIdentifier, row.InstructorId)
          .input('Date', sql.Date, date)
          .query(`
            SELECT 1 FROM Schedule WHERE InstructorId = @InstructorId AND Date = @Date
          `);
  
        if (duplicateCheck.recordset.length > 0) {
          errors.push(`Duplicate entry found for InstructorId ${row.InstructorId} on Date ${date}`);
          continue;
        }
  
        // Insert into the database
        await pool.request()
          .input('uniqueId', sql.UniqueIdentifier, crypto.randomUUID())
          .input('InstructorId', sql.UniqueIdentifier, row.InstructorId)
          .input('RoomId', sql.UniqueIdentifier, row.RoomId)
          .input('Course', sql.NVarChar, row.Course)
          .input('Campus', sql.NVarChar, row.Campus)
          .input('Date', sql.Date, date)
          .input('StartTime', sql.Time, row.StartTime)
          .input('EndTime', sql.Time, row.EndTime)
          .input('Status', sql.NVarChar, row.Status || 'Pending')
          .query(`
            INSERT INTO Schedule (uniqueId, InstructorId, RoomId, Course, Campus, Date, StartTime, EndTime, Status)
            VALUES (@uniqueId, @InstructorId, @RoomId, @Course, @Campus, @Date, @StartTime, @EndTime, @Status)
          `);
      }
  
      if (errors.length > 0) {
        return res.status(207).json({
          message: 'Some entries encountered errors',
          errors,
          status: false,
          status_code: 207,
        });
      } else {
        return res.status(200).json({
          message: 'Schedule data uploaded successfully',
          status: true,
          status_code: 200,
        });
      }
  
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({
          error: "Internal Server Error",
          details: err.message
        });
      }
      console.error(err);
    }
  });
  

  const updateSchedule = asyncHandler(async (req, res) => {
    const { uniqueId } = req.params;  
    const { InstructorId, Date, RoomId, Course, Campus, StartTime, EndTime } = req.body;  

    if( !InstructorId || !Date || !RoomId ||  !Course || !Campus || !StartTime || !EndTime){
        return res.status(400).json({
            error: "Missing required field(s)",
            status: false,
            status_code: 400
        });
    }
  
    const q = `
        UPDATE Schedule 
        SET InstructorId = @InstructorId, Date = @Date, RoomId = @RoomId, Course = @Course, Campus = @Campus, StartTime = @StartTime, EndTime = @EndTime
        WHERE uniqueId = @UniqueId
    `;
  
    try {
        const pool = await sql.connect(); 
        const request = pool.request();
  
        request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
        request.input('InstructorId', sql.NVarChar, InstructorId);
        request.input('Date', sql.NVarChar, Date);
        request.input('RoomId', sql.NVarChar, RoomId);
        request.input('Course', sql.NVarChar, Course);
        request.input('Campus', sql.NVarChar, Campus);
        request.input('StartTime', sql.Time, StartTime);
        request.input('EndTime', sql.Time, EndTime);
  
        await request.query(q);
  
        res.status(200).json({
            message: 'Schedule updated successfully',
            status_code: 200,
            uniqueId
        });
    } catch (err) {
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
  });



  const getSingleSchedule = asyncHandler(async (req, res) =>{
    const uniqueId = req.params.uniqueId;
    const q = 'SELECT * FROM Schedule WHERE uniqueId = @uniqueId';
    console.log(uniqueId)
    console.log(q)
    try{
        const pool = await sql.connect();
        const request = pool.request();
        request.input("uniqueId", sql.UniqueIdentifier, uniqueId)
        const result = await request.query(q)
        if(result.recordset.length === 0){
            return res.status(404).json({
                message:"Schedule not found or does not exist",
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
    getInstructorSchedule,
    uploadExcel,
    updateSchedule,
    getSingleSchedule
}
