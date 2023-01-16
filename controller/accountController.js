require('dotenv').config();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

/**
 * Check if user is connected
 * @param {object} req ExpressJS request data
 * @param {function} res ExpressJS response functions
 * @param {function} next Go to next middleware
 * @returns {next}
 */
exports.isConnected = async (req, res, next) => {
    try {
        const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
            process.env.JWT_SECRET
        );

        if (decoded) {
            return next();
        }
    } catch (error) {
        return res.redirect('/');
    }
}
