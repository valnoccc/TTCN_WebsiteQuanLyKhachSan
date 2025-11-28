const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_qlks',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Phải có .promise() để dùng được await trong Model
module.exports = pool.promise();