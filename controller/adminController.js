require('dotenv').config();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

/**
 * Check if user has admin role
 * @param {object} req ExpressJS request data
 * @param {function} res ExpressJS response functions
 * @param {function} next Go to next middleware
 * @returns {next}
 */
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