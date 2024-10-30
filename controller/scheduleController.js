const asyncHandler = require('express-async-handler')
const { sql } = require('../config/db')
const { formatResponse } = require('../utils/responseFormatter')
const { generateRefreshToken, generateToken } = require('../config/generateToken');
const { token } = require('morgan');



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



const acceptSchedule = asyncHandler(async (req, res) => {
  const { scheduleId, instructorId } = req.params;    // try req.body too if params no work
  const q = `
      UPDATE Schedule 
      SET Status = 'Accepted' 
      WHERE uniqueId = @ScheduleId AND InstructorId = @InstructorId;
  `;

  try {
      const pool = await sql.connect();
      const request = pool.request();
      request.input('ScheduleId', sql.UniqueIdentifier, scheduleId);
      request.input('InstructorId', sql.UniqueIdentifier, instructorId);

      await request.query(q);

      res.status(200).json({
          message: 'Schedule accepted successfully'
      });
  } catch (err) {
      res.status(500).json({
          error: 'Internal server error',
          details: err.message
      });
  }
});


const rejectSchedule = asyncHandler(async (req, res) => {
  const { scheduleId, instructorId } = req.params;  // try req.body too if params no work
  const q = `
      UPDATE Schedule 
      SET Status = 'Rejected' 
      WHERE uniqueId = @ScheduleId AND InstructorId = @InstructorId;
  `;

  try {
      const pool = await sql.connect();
      const request = pool.request();
      request.input('ScheduleId', sql.UniqueIdentifier, scheduleId);
      request.input('InstructorId', sql.UniqueIdentifier, instructorId);

      await request.query(q);

      res.status(200).json({
          message: 'Schedule rejected successfully'
      });
  } catch (err) {
      res.status(500).json({
          error: 'Internal server error',
          details: err.message
      });
  }
});





module.exports = {
    getAllSchedule,
    acceptSchedule,
    rejectSchedule
}
