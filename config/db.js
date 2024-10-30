const sql = require('mssql');
require('dotenv').config();

const dbConfig ={
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt:false,
        trustedConnection: true,
        enableArithAbort:true,
        trustServerCertificate:true
    },
    port: parseInt(process.env.DB_PORT, 10),
}

console.log(process.env.DB_NAME)
console.log(process.env.DB_USER)
console.log(process.env.DB_PASSWORD)
console.log(process.env.DB_SERVER)

module.exports = {
    connect:()=>sql.connect(dbConfig), sql
}