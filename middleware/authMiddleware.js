const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")
const { sql} = require("../config/db")


const authorize = (userType) => asyncHandler(async (req, res, next) => {
    const { Token } = req.cookies || req.headers.authorization;

    if (!Token) {
        return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    try {
        const pool = await sql.connect();
        const query = `SELECT * FROM ${userType} WHERE Token = @Token`;
        const result = await pool.request().input('Token', sql.NVarChar, Token).query(query);

        if (!result.recordset[0]) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        req.user = result.recordset[0]; 
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




const isAdmin = asyncHandler(async(req, res, next)=>{
    console.log(req)
    if(!req.cookies.refreshToken ){
        return res.status(401).json({
            message:"Not Authorised"
        })
    }
    const refreshToken = req.cookies.refreshToken;
    let decoded;
    try{
        decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    }catch(err){
        throw new Error("Not authorised or token expired")
    }

    console.log(decoded)

    const uniqueId = decoded.uniqueId
    const pool = await sql.connect();

    const result = await pool.request()
    .input("uniqueId", sql.NVarChar, uniqueId)
    .query("SELECT  role FROM Users WHERE uniqueId = @uniqueId");

    console.log(result)
     const adminUser = result.recordset[0];
     console.log(adminUser)

     if(!adminUser){
        return res.status(404).json({
            message: "User not found"
        })
     }

     if(adminUser.role !== "Admin"){
        return res.status(403).json({
            message: "You are not an admin"
        })
     }
     next();
})

const authMiddleware = asyncHandler(async(req, res, next)=>{
    console.log(req)
   let token;
    if(req.headers.authorization.startsWith("Bearer") ){
        token = req.headers.authorization.split(' ')[1];
        console.log(token)
  
        try{
            if(token){

                const  decoded = jwt.verify(token, process.env.JWT_SECRET);
                 console.log(decoded)
         
                 const uniqueId = decoded.uniqueId
                 const pool = await sql.connect();
             
                 const result = await pool.request()
                 .input("uniqueId", sql.NVarChar, uniqueId)
                 .query("SELECT * FROM Users WHERE uniqueId = @uniqueId");
             
                 console.log(result)
                  const user = result.recordset[0];
                  console.log(user)
             
                  if(user){
                  req.user = user
                  next();
                  }else{
                    throw new Error("User not found")
                  }
            }
        
        }catch(err){
            throw new Error("Not authorised or token expired")
        }
    }else{
        throw new Error("No token is attached")
    }
})




module.exports ={
    isAdmin,
    authMiddleware,
    authorize
}