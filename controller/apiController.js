require('dotenv').config();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

exports.allowApiAccess = async (req, res, next) => {
    try {
        const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
            process.env.JWT_SECRET
        );

        if (decoded) {
            return next();
        }
    } catch (error) {
        return res.status(403);
    }
};
