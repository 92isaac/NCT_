const asyncHandler = require('express-async-handler')
const { sql } = require('../config/db')
const { formatResponse } = require('../utils/responseFormatter')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { generateRefreshToken, generateToken } = require('../config/generateToken');
const { token } = require('morgan');

const getAllUsers = asyncHandler(async(req, res)=>{
    const q = 'SELECT * FROM Users'
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

const getAllStudentOnly = asyncHandler(async(req, res)=>{
    // const q = "SELECT * FROM Users WHERE role = 'Student'";
    const q = `
        SELECT * FROM Users u JOIN Student stud ON u.uniqueId = stud.uniqueId WHERE u.role = 'Student'
    `
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

const getAllInstructorstOnly = asyncHandler(async(req, res)=>{
    const q = "SELECT * FROM Users WHERE role = 'Instructor'";
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

const getAllInstructorstDetailsOnly = asyncHandler(async(req, res)=>{
    // const q = "SELECT * FROM Users WHERE role = 'Instructor'";
    const q = `
        SELECT * FROM Users u JOIN Instructor instr ON u.uniqueId = instr.uniqueId WHERE u.role = 'Instructor'
    `
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

const getSingleUser = asyncHandler(async (req, res) =>{
    const uniqueId = req.params.uniqueId;
    const q = 'SELECT * FROM Users WHERE uniqueId = @uniqueId';
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

const deleteUser = asyncHandler(async (req, res) => {
    const { uniqueId } = req.params;
    console.log(uniqueId);

    const selectUserQuery = 'SELECT * FROM Users WHERE uniqueId = @uniqueId';
    const deleteInstructorQuery = 'DELETE FROM Instructor WHERE uniqueId = @uniqueId';
    const deleteStudentQuery = 'DELETE FROM Student WHERE uniqueId = @uniqueId';
    const deleteUserQuery = 'DELETE FROM Users WHERE uniqueId = @uniqueId';

    try {
        const pool = await sql.connect();
        const request = pool.request();

        // Check if the user exists
        request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
        const result = await request.query(selectUserQuery);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result.recordset[0]; // Access the user object

        // Delete from related tables based on role
        if (user.role === "Instructor") {
            await request.query(deleteInstructorQuery);
        } else if (user.role === "Student") {
            await request.query(deleteStudentQuery);
        }

        // Delete the user from the Users table
        await request.query(deleteUserQuery);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
});


// const deleteUser = asyncHandler(async (req, res)=>{
//     const {uniqueId} = req.params;
//     console.log(uniqueId)
//     const q = 'SELECT * FROM Users WHERE uniqueId = @uniqueId'
//     try{
//         const pool = await sql.connect();
//         const request = pool.request();
//         request.input("uniqueId", sql.UniqueIdentifier, uniqueId)
//         const result = await request.query(q)
//         const user = result.rowsAffected[0]
//         if(result.rowsAffected[0] === 0){
//             return res.status(404).json({
//                 message: "User not found"
//             })
//         }
//         if(user.role === "Instructor"){
//             await user.query("DELETE FROM Instructor WHERE instructorId = @instructorId")
//         }else if(user.role === "Student"){
//             await request.query("DELETE FROM Student WHERE studentId = @studentId ")
//         }

//         const deletUser = await request.query("DELETE FROM Users WHERE uniqueId = @uniqueId")
//         if(deletUser.rowsAffected[0] === 0){
//             return res.status(404).json({
//                 message: "User not found"
//             })
//         }
//         res.status(200).json({
//             message: 'User deleted successfully'
//         })
//     }catch(err){
//         res.status(500).json({
//             error: "Internal server errort",
//             details: err.message
//         })
//     }

// });

const createUser = asyncHandler(async (req, res)=>{
    const uniqueId = uuidv4();
    const {firstname, middlename,lastname, email, phonenumber, password, role, profileImageUrl} = req.body;
    const q = `INSERT INTO Users (uniqueId, firstname, middlename,lastname, email, phonenumber,password, role, profileImageUrl)
    VALUES (@uniqueId, @firstname, @lastname, @email, @phonenumber, @password, @role, @profileImageUrl )`;
    try{
        const pool = await sql.connect();
        const request = pool.request();

        request.input('uniqueId', sql.UniqueIdentifier, uniqueId)
        request.input('firstname', sql.NVarChar, firstname)
        request.input('middlename', sql.NVarChar, middlename)
        request.input('lastname', sql.NVarChar, lastname)
        request.input('email', sql.NVarChar, email)
        request.input('phonenumber', sql.NVarChar, phonenumber)
        request.input('password', sql.NVarChar, password)
        request.input('role', sql.NVarChar, role)
        request.input('profileImageUrl', sql.NVarChar, profileImageUrl || null)

        await request.query(q);
        res.status(200).json({
            message: 'User created successfully',
            uniqueId
        })
    }catch(err){
        res.status(500).json({
            error: "Internal server errort",
            details: err.message
        })
    }
})

// const createInstructor = asyncHandler(async (req, res)=>{
//     const uniqueId = uuidv4();
//     const {firstname, middlename,lastname, email, phonenumber, password, role, profileImageUrl, department, title} = req.body;
//     const q = `INSERT INTO Users (uniqueId, firstname, middlename,lastname, email, phonenumber,password, role, profileImageUrl)
//     VALUES (@uniqueId, @firstname, @lastname, @middlename, @email, @phonenumber, @password, @role, @profileImageUrl )`;
//     const InstruQ = `INSERT INTO Instructor (uniqueId, department, title)
//     VALUES (@uniqueId, @department, @title )`;
//     try{
//         const pool = await sql.connect();
//         const transaction = new sql.Transaction(pool);

//         await transaction.begin()
//         const request = new sql.Request(transaction);

//         request.input('uniqueId', sql.UniqueIdentifier, uniqueId)
//         request.input('firstname', sql.NVarChar, firstname)
//         request.input('middlename', sql.NVarChar, middlename)
//         request.input('lastname', sql.NVarChar, lastname)
//         request.input('email', sql.NVarChar, email)
//         request.input('phonenumber', sql.NVarChar, phonenumber)
//         request.input('password', sql.NVarChar, password)
//         request.input('role', sql.NVarChar, role)
//         request.input('profileImageUrl', sql.NVarChar, profileImageUrl || null)

//         await request.query(q);

//         const userResult = await request.query('SELECT SCOPE_IDENTITY() AS uniqueId')
//         const UserUniqueId = userResult.recordset[0].uniqueId;

//         // request.input('uniqueid', sql.UniqueIdentifier, UserUniqueId)
//         // request.input('department', sql.NVarChar, department)
//         // request.input('title', sql.NVarChar, title)
      
//         // await request.query(InstruQ);

//         await request 
//             .input('uniqueid', sql.UniqueIdentifier, UserUniqueId)
//             .input('department', sql.NVarChar, department)
//             .input('title', sql.NVarChar, title)
//             .query(InstruQ)

//         await transaction.commit()

//         res.status(200).json({
//             message: 'User created successfully',
//             uniqueId
//         })
//     }catch(err){
//         res.status(500).json({
//             error: "Internal server errort",
//             details: err.message
//         })
//     }
// })

const createInstructor = asyncHandler(async (req, res) => {
    const uniqueId = uuidv4();
    const {
        firstname, middlename, lastname, email, 
        phonenumber, password, role, profileImageUrl, 
        department, title
    } = req.body;

    const userInsertQuery = `
        INSERT INTO Users (uniqueId, firstname, middlename, lastname, email, phonenumber, password, role, profileImageUrl)
        VALUES (@uniqueId, @firstname, @middlename, @lastname, @email, @phonenumber, @password, @role, @profileImageUrl)
    `;

    const instructorInsertQuery = `
        INSERT INTO Instructor (uniqueId, department, title)
        VALUES (@uniqueId, @department, @title)
    `;

    try {
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);

        await transaction.begin(); // Start transaction
        const request = new sql.Request(transaction);

        // Input parameters for Users table
        request.input('uniqueId', sql.UniqueIdentifier, uniqueId);
        request.input('firstname', sql.NVarChar, firstname);
        request.input('middlename', sql.NVarChar, middlename);
        request.input('lastname', sql.NVarChar, lastname);
        request.input('email', sql.NVarChar, email);
        request.input('phonenumber', sql.NVarChar, phonenumber);
        request.input('password', sql.NVarChar, password);
        request.input('role', sql.NVarChar, role);
        request.input('profileImageUrl', sql.NVarChar, profileImageUrl || null);

        // Execute User insertion
        await request.query(userInsertQuery);

        // Use the same uniqueId for the Instructor table
        request.input('department', sql.NVarChar, department);
        request.input('title', sql.NVarChar, title);

        // Execute Instructor insertion
        await request.query(instructorInsertQuery);

        await transaction.commit(); // Commit the transaction

        res.status(200).json({
            message: 'User created successfully',
            uniqueId: uniqueId
        });
    } catch (err) {
        // Rollback the transaction on error
        if (transaction) await transaction.rollback();

        res.status(500).json({
            error: "Internal server error",
            details: err.message
        });
    }
});


const updateUser = asyncHandler(async (req, res)=>{
    const {uniqueId} = req.params;
    const { firstname, lastname, phonenumber, password, profileImageUrl } = req.body;
    const q = `UPDATE Users SET  firstname = @firstname, lastname = @lastname, phonenumber = @phonenumber, password =@password, profileImageUrl = @profileImageUrl WHERE uniqueId =  @uniqueId`;

    try{
        const pool = await sql.connect();
        const request = pool.request();


        request.input('uniqueId', sql.UniqueIdentifier, uniqueId)
        request.input('firstname', sql.NVarChar, firstname)
        request.input('lastname', sql.NVarChar, lastname)
        request.input('phonenumber', sql.NVarChar, phonenumber)
        request.input('password', sql.NVarChar, password)
        request.input('profileImageUrl', sql.NVarChar, profileImageUrl || null)

        const result =  await request.query(q);
        if(result.rowsAffected[0] === 0){
            return res.status(404).json({
                message: "User not found"
            })
        }
        res.status(200).json({
            message: 'User updated successfully',
            uniqueId
        })
    }catch(err){
        res.status(500).json({
            error: "Internal server errort",
            details: err.message
        })
    }
})

const loginUserCtrl = asyncHandler(async (req, res)=>{
    const { email, password } = req.body;
    console.log(email, password)
    try{
        const pool = await sql.connect()
        const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .query('SELECT *  FROM users WHERE email = @email')

        const findUser = result.recordset[0];
        console.log(findUser)
        console.log(findUser.password)

        if(!findUser){
            throw new Error("Invalid credentials")
        }
        const isPassword = password === findUser.password
        console.log(isPassword)
        if(!isPassword){
            throw new Error("Invalid credentials")
        }

        // if(findUser && await bcrypt.compare(password, findUser.password) || findUser && findUser.password){
            const refreshToken = await generateRefreshToken(findUser.uniqueId)
            await pool.request()
            .input('refreshToken', sql.NVarChar, refreshToken)
            .input('uniqueId', sql.UniqueIdentifier, findUser.uniqueId)
            .query("UPDATE Users SET refreshToken = @refreshToken WHERE uniqueId = @uniqueId")
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge : 48 * 60 * 60 * 1000
            });
            res.json({
                uniqueId:findUser.uniqueId,
                firstname: findUser.firstname,
                lastname: findUser.lastname,
                email: findUser.email,
                token: generateToken(findUser.uniqueId)
            })
        // }else {
        //     throw new Error("Invalid credentials")
        // }

    }catch(err){
        res.status(500).json({
            error: err,
            details: err.message
        })
    }
})

const logoutUser = asyncHandler(async(req, res)=>{
    const { refreshToken } = req.cookies
    if(!refreshToken){
        return res.status(400).json({
            message: "User is not logged in"
        })
    }

    try{
        const pool = await sql.connect();
        const result = await pool.request()
        .input("refreshToken", sql.NVarChar, refreshToken)
        .query("SELECT * FROM users WHERE refreshToken = @refreshToken");
        
        const findUser = result.recordset[0];

        if(!findUser){
            return res.status(400).json({
                message: "User not found or already logged out"
            })
        }

        await pool.request()
        .input("uniqueId", sql.UniqueIdentifier, findUser.uniqueId)
        .query("UPDATE users  SET refreshToken = NULL WHERE uniqueId = @uniqueId")

        res.clearCookie("refreshToken", {
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
    getAllUsers,
    getAllStudentOnly,
    getAllInstructorstOnly,
    getAllInstructorstDetailsOnly,
    getSingleUser,
    deleteUser,
    createUser,
    updateUser,
    loginUserCtrl, 
    logoutUser,
    createInstructor
}
