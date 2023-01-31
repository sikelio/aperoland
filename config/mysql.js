require('dotenv').config();
const mysql = require('mysql');

const connection = mysql.createConnection({
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
});

connection.connect((error) => {
    if (error) {
        console.error(error);
    } else {
        console.log('Connected to MySQL');
    }
});

module.exports = connection;
