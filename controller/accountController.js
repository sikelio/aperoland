require('dotenv').config();
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const mysql = require('../config/mysql');

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

/**
 * Check if user is already connected connected
 * @param {object} req ExpressJS request data
 * @param {function} res ExpressJS response functions
 * @param {function} next Go to next middleware
 * @returns {next}
 */
exports.isAlreadyConnected = (req, res, next) => {
    let sql =  `
        SELECT * FROM events
        WHERE uuid = ?
    `;

    mysql.query(sql, req.params.uuid, async (error, results) => {
        if (error) {
            return res.redirect('/internal-error');
        }

        let idEvent = results[0].idEvent;

        try {
            const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                process.env.JWT_SECRET
            );

            sql = `
                SELECT * FROM eventsparticipate
                WHERE idUser = ? AND idEvent = ?
            `;

            mysql.query(sql, [decoded.idUser, idEvent], (error, results) => {
                if (error) {
                    return res.redirect('/internal-error');
                }

                if (results.length > 0) {
                    return res.redirect(`/app/event/${idEvent}`);
                }

                sql = `
                    INSERT INTO eventsparticipate
                    SET ?
                `;

                mysql.query(sql, { idEvent: idEvent, idUser: decoded.idUser }, (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    return res.redirect(`/app/event/${idEvent}`);
                });
            });
        } catch (error) {
            return next();
        }
    });
};

/**
 * Check if user exist
 * @param {object} req ExpressJS request data
 * @param {function} res ExpressJS response functions
 * @param {function} next Go to next middleware
 * @returns {next}
 */
exports.userExist = (req, res, next) => {

};
