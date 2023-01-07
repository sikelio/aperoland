require('dotenv').config();
const mysql = require('../config/mysql');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

/**
 * Method to check if user is allowed to go next
 * @param {object} req ExpressJS request data
 * @param {function} res ExpressJS response functions
 * @param {function} next Go to next middleware
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
            return res.redirect('/');
        }
    });
};

/**
 * Method to check if user is the organizer of the event
 * @param {object} req ExpressJS request data
 * @param {function} res ExpressJS response functions
 * @param {function} next Go to next middleware
 * @returns {redirect}
 */
exports.isOrganizer = (req, res, next) => {
    let sql = `
        SELECT * FROM events
        WHERE idEvent = ?
    `;

    mysql.query(sql, req.params.idEvent, async (error, results) => {
        if (error) {
            return res.redirect('/internal-error');
        }

        try {
            const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                process.env.JWT_SECRET
            );

            if (results[0].idUser != decoded.idUser) {
                return res.redirect('/forbidden');
            }

            next();
        } catch (error) {
            req.redirect('/');
        }
    });
};

/**
 * Delete old ics file to replace it with a new file
 * @param {object} req ExpressJS request data
 * @param {function} res ExpressJS response functions
 * @param {function} next Go to next middleware
 * @returns {void}
 */
exports.deleteOldIcsFile = (req, res, next) => {
    let sql = `
        SELECT * FROM events
        WHERE idEvent = ?
    `;

    mysql.query(sql, req.params.idEvent, (error, results) => {
        if (error) {
            return res.redirect('/internal-error');
        }

        let eventName = results[0].name.replace(/\s/g, '-').toLowerCase();

        if (fs.existsSync(`calendar/${results[0].idEvent}-${eventName}.ics`)) {
            fs.unlinkSync(`calendar/${results[0].idEvent}-${eventName}.ics`);
        }

        return next();
    });
};