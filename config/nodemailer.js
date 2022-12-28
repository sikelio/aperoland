require('dotenv').config();
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: 'mail.name.com',
    port: process.env.NODEMAILER_PORT,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Connected to mail system');
    }
});

module.exports = transporter;
