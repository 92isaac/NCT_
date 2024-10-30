const asyncHandler = require('express-async-handler')
const { sql } = require('../config/db')
const { formatResponse } = require('../utils/responseFormatter')
const { generateRefreshToken, generateToken } = require('../config/generateToken');
const { token } = require('morgan');



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


const updateRoom = asyncHandler(async (req, res) => {
  const { uniqueId } = req.params;  
  const { FirstName, LastName, PhoneNumber, Password, image } = req.body;  

  const q = `
      UPDATE Room 
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
          message: 'Room updated successfully',
          uniqueId
      });
  } catch (err) {
      res.status(500).json({
          error: "Internal server error",
          details: err.message
      });
  }
});




module.exports = {
    updateRoom,
    getAllRoom,
}
