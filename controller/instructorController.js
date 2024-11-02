const asyncHandler = require('express-async-handler')
const { sql } = require('../config/db')
const { formatResponse } = require('../utils/responseFormatter')
const { generateRefreshToken, generateToken } = require('../config/generateToken');
const { token } = require('morgan');




const updateInstructorProfile = asyncHandler(async (req, res) => {
  const { uniqueId } = req.params;  
  const { FirstName, LastName, PhoneNumber, Password, image } = req.body;  

  const q = `
      UPDATE Instructor 
      SET FirstName = @FirstName, LastName = @LastName, PhoneNumber = @PhoneNumber, Password = @Password, image = @image
      WHERE uniqueId = @uniqueId
  `;

  try {
      const pool = await sql.connect(); 
      const request = pool.request();

      request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
      request.input('FirstName', sql.NVarChar, FirstName);
      request.input('LastName', sql.NVarChar, LastName);
      request.input('PhoneNumber', sql.NVarChar, PhoneNumber);
      request.input('Password', sql.NVarChar, Password);
      request.input('image', sql.NVarChar, image || null);

      await request.query(q);

      res.status(200).json({
          message: 'Instructor profile updated successfully',
          uniqueId
      });
  } catch (err) {
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});




// const getInstructorProfile = asyncHandler(async (req, res) => {
//     console.log(req.headers.authorization)
 
// const authHeader = req.headers.authorization; 
// const Token = authHeader && authHeader.split(' ')[1];
// console.log(Token)

//   if (!Token) {
//     return res.status(401).json({ message: 'Not authorized, token missing' });
//   }

//   try {
//     const pool = await sql.connect();
//     const result = await pool.request()
//       .input('Token', sql.NVarChar, Token)
//       .query(`SELECT * FROM Instructor WHERE Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVJZCI6IjVGNTZFODE2LTFERjEtNDhFMC1CNEQ5LTIxRTVBQTBCRDlDQSIsImlhdCI6MTczMDUxNjMxNCwiZXhwIjoxNzMwNjAyNzE0fQ.KbzlzIjZNPKt7Uet0NDEo_HatxnumCCwObeqidP2xWE'`);
    
//     const instructor = result.recordset[0];

//     if (!instructor) {
//       return res.status(404).json({ message: 'Instructor not found' });
//     }

 
//     res.status(200).json({
//       uniqueId: instructor.uniqueId,
//       FirstName: instructor.FirstName,
//       LastName: instructor.LastName,
//       Email: instructor.Email,
//       PhoneNumber: instructor.PhoneNumber,
//       Education: instructor.Education,
//       Bio: instructor.Bio,
//       Department: instructor.Department,
//       image: instructor.image,
//       title: instructor.title,
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Internal server error", details: err.message });
//   }
// });




const getInstructorProfile = asyncHandler(async (req, res) => {
    // console.log("Authorization Header:", req.headers.authorization);
  
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1].trim();
    // console.log("Extracted Token:", token);
  
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
  
    try {
      const pool = await sql.connect();
      const result = await pool.request()
        .input('Token', sql.NVarChar, token.trim())
        .query("SELECT * FROM Instructor WHERE Token = @Token");
  
      const instructor = result.recordset[0];
  
      if (!instructor) {
        return res.status(404).json({ message: 'Instructor not found' });
      }
  
      res.status(200).json({
        uniqueId: instructor.uniqueId,
        FirstName: instructor.FirstName,
        LastName: instructor.LastName,
        Email: instructor.Email,
        PhoneNumber: instructor.PhoneNumber,
        Education: instructor.Education,
        Bio: instructor.Bio,
        Department: instructor.Department,
        image: instructor.image,
        title: instructor.title,
      });
    } catch (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Internal server error", details: err.message });
    }
  });
  



// const loginStudentCtrl = asyncHandler(async (req, res)=>{
//     const { Email, Password } = req.body;
//     console.log(Email, Password)
//     try{
//         const pool = await sql.connect()
//         const result = await pool.request()
//         .input('Email', sql.NVarChar, Email)
//         .query('SELECT * FROM Instr WHERE Email = @Email')

//         const findUser = result.recordset[0];
//         console.log(findUser)
//         console.log(findUser.Password)

//         if(!findUser){
//             throw new Error("Invalid credentials")
//         }
//         const isPassword = Password === findUser.Password
//         console.log(isPassword)
//         if(!isPassword){
//             throw new Error("Invalid credentials")
//         }

//             const Token = await generateRefreshToken(findUser.uniqueId)
//             await pool.request()
//             .input('Token', sql.NVarChar, Token)
//             .input('uniqueId', sql.UniqueIdentifier, findUser.uniqueId)
//             .query("UPDATE Student SET Token = @Token WHERE uniqueId = @uniqueId")
//             res.cookie('Token', Token, {
//                 httpOnly: true,
//                 maxAge : 48 * 60 * 60 * 1000
//             });
//             res.json({
//                 uniqueId:findUser.uniqueId,
//                 FirstName: findUser.FirstName,
//                 LastName: findUser.LastName,
//                 Email: findUser.Email,
//                 Token: generateToken(findUser.uniqueId)
//             })

//     }catch(err){
//         res.status(500).json({
//             error: err,
//             details: err.message
//         })
//     }
// })



// const loginInstructorCtrl = asyncHandler(async (req, res)=>{
//     const { Email, Password } = req.body;
//     console.log(Email, Password)
//     try{
//         const pool = await sql.connect()
//         const result = await pool.request()
//         .input('Email', sql.NVarChar, Email)
//         .query('SELECT * FROM Instructor WHERE Email = @Email')

//         const findUser = result.recordset[0];
//         console.log(findUser)
//         console.log(findUser.Password)

//         if(!findUser){
//             throw new Error("Invalid credentials")
//         }
//         const isPassword = Password === findUser.Password
//         console.log(isPassword)
//         if(!isPassword){
//             throw new Error("Invalid credentials")
//         }

//             const Token = await generateRefreshToken(findUser.uniqueId)
//             await pool.request()
//             .input('Token', sql.NVarChar, Token)
//             .input('uniqueId', sql.UniqueIdentifier, findUser.uniqueId)
//             .query("UPDATE Instructor SET Token = @Token WHERE uniqueId = @uniqueId")
//             res.cookie('Token', Token, {
//                 httpOnly: true,
//                 maxAge : 48 * 60 * 60 * 1000
//             });
//             res.status(200).json({
//                 uniqueId:findUser.uniqueId,
//                 FirstName: findUser.FirstName,
//                 LastName: findUser.LastName,
//                 Email: findUser.Email,
//                 image: findUser.image,
//                 userType: 'Instructor',
//                 Token: generateToken(findUser.uniqueId)
//             })

//     }catch(err){
//         res.status(500).json({
//             error: err,
//             details: err.message
//         })
//     }
// })

const loginInstructorCtrl = asyncHandler(async (req, res) => {
    const { Email, Password } = req.body;
    console.log("Login Attempt:", Email, Password);
  
    try {
      const pool = await sql.connect();
      const result = await pool.request()
        .input('Email', sql.NVarChar, Email)
        .query('SELECT * FROM Instructor WHERE Email = @Email');
  
      const findUser = result.recordset[0];
      console.log("Found User:", findUser);
  
      if (!findUser) {
        throw new Error("Invalid credentials");
      }
  
      const isPassword = Password === findUser.Password;
      console.log("Password Match:", isPassword);
      if (!isPassword) {
        throw new Error("Invalid credentials");
      }
  
      const Token = await generateRefreshToken(findUser.uniqueId);
      console.log("Generated Token:", Token);
  
      await pool.request()
        .input('Token', sql.NVarChar, Token)
        .input('uniqueId', sql.UniqueIdentifier, findUser.uniqueId)
        .query("UPDATE Instructor SET Token = @Token WHERE uniqueId = @uniqueId");
  
      const tokenVerification = await pool.request()
        .input('uniqueId', sql.UniqueIdentifier, findUser.uniqueId)
        .query("SELECT Token FROM Instructor WHERE uniqueId = @uniqueId");
  
      console.log("Stored Token in DB:", tokenVerification.recordset[0].Token);
  
      res.cookie('Token', Token, {
        httpOnly: true,
        maxAge: 48 * 60 * 60 * 1000
      });
  
      res.status(200).json({
        uniqueId: findUser.uniqueId,
        FirstName: findUser.FirstName,
        LastName: findUser.LastName,
        Email: findUser.Email,
        image: findUser.image,
        userType: 'Instructor',
        Token  // Use the same token here as generated
      });
  
    } catch (err) {
      console.error("Login Error:", err.message);
      res.status(500).json({
        error: err,
        details: err.message
      });
    }
  });
  

const logoutStudent = asyncHandler(async(req, res)=>{
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
        .query("SELECT * FROM Student WHERE Token = @Token");
        
        const findUser = result.recordset[0];

        if(!findUser){
            return res.status(400).json({
                message: "User not found or already logged out"
            })
        }

        await pool.request()
        .input("uniqueId", sql.UniqueIdentifier, findUser.uniqueId)
        .query("UPDATE Student SET Token = NULL WHERE uniqueId = @uniqueId")

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
    updateInstructorProfile,
    loginInstructorCtrl, 
    logoutStudent,
    getInstructorProfile,
}
