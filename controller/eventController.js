require('dotenv').config();
const mysql = require('../config/mysql');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

/**
 * Method to check if user is allowed to go next
 * @param {object} req ExpressJS request data
 * @param {function} res ExpressJS response functions
 * @returns {redirect}
 */
exports.isAllowed = (req, res, next) => {
    let sql = `
        SELECT eventsparticipate.idUser FROM events
        RIGHT JOIN eventsparticipate ON events.idEvent = eventsparticipate.idEvent
        WHERE events.idEvent = ?
    `;

    mysql.query(sql, req.params.idEvent, async (error, results) => {
        if (error) {
            return res.redirect('/internal-error');
        }

        let isAllowed = false;

        try {
            const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                process.env.JWT_SECRET
            );

            results.forEach(element => {
                if (decoded.idUser == element.idUser) {
                    isAllowed = true;
                }
            });

            if (isAllowed == false) {
                return res.status(403).redirect('/forbidden');
            }

            return next();
        } catch (error) {
            console.error(error);
            return res.redirect('/');
        }
    });
};