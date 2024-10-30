const PORT = process.env.DB_PORT || 4000;
require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors')
const { connect, sql } = require('./config/db')
const cookierParser = require('cookie-parser')
const morgan = require("morgan")
const { notFound, errorhandler} = require('./middleware/error_handle')
const userRoute = require('./routes/user_routes')
const admin_route = require('./routes/admin_route')
const student_route = require('./routes/student_route')
const room_route = require('./routes/room_route')
const schedule_route = require('./routes/schedule_route')
const instructor_route = require('./routes/instructor_route')

app.use(cors())
app.use(morgan('dev'))
app.use(cookierParser())
app.use(express.json())






connect()
.then((connection)=>{
    // console.log(connection)
    console.log("Connected to the database")
})
.catch((error)=>{
    console.log("Connection fails")
    console.log(error)
})

app.use('/api/user', userRoute)
app.use('/api/admin', admin_route)
app.use('/api/student', student_route)
app.use('/api/instructor', instructor_route)
app.use('/api/room', room_route)
app.use('/api/schedule', schedule_route)

app.use(notFound)
app.use(errorhandler)

app.listen(PORT, ()=>{
    console.log(`Server is listening on ${PORT}`)
})

