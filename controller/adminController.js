require('dotenv').config();
const mysql = require('../config/mysql');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

exports.isAdmin = async (req, res, next) => {
    try {
        const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
            process.env.JWT_SECRET
        );

        if (decoded.role != 'Admin') {
            return res.redirect('/');
        }

        return next();
    } catch (error) {
        return res.redirect('/');
    }
};