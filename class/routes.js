require('dotenv').config();
const components = require('./components');
const info = require('../package.json');
const mysql = require('./mysql');
const jwt = require('jsonwebtoken');
const path = require('path');
const { promisify } = require('util');

class Routes {
    init(app) {
        this.#public(app);
        this.#error(app);
        this.#application(app);
        this.#admin(app);
    }

    #public(app) {
        app.get('/', async (req, res) => {
            if (req.cookies.aperolandTicket) {
                try {
                    const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                        process.env.JWT_SECRET
                    );

                    return res.redirect('/app/home');
                } catch (error) {
                    return res.clearCookie('aperolandTicket');
                }
            } else {
                return res.render('home', {
                    navbar: components.publicNavbar
                });
            }
        });

        app.get('/favicon.ico', (req, res) => {
            res.sendFile(path.join(__dirname, '../pages/public/favicon.ico'));
        });

        app.get('/register', (req, res) => {
            res.render('register', {
                navbar: components.publicNavbar,
                projectName: info.displayName,
                cgu: components.cgu,
                currentYear: new Date().getFullYear()
            });
        });

        app.get('/login', (req, res) => {
            res.render('login', {
                navbar: components.publicNavbar,
                projectName: info.displayName,
                currentYear: new Date().getFullYear()
            });
        });

        app.post('/logout', (req, res) => {
            res.clearCookie('aperolandTicket');

            return res.redirect('/');
        });
    }

    #error(app) {}

    #application(app) {
        app.get('/app/home', async (req, res) => {
            if (req.cookies.aperolandTicket) {
                try {
                    const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                        process.env.JWT_SECRET
                    );

                    mysql.query('SELECT username FROM users WHERE idUser = ?', [decoded.idUser], (error, results) => {
                        if (error) {}

                        const sql = `
                            SELECT events.name, users.username, events.description, events.uuid FROM eventsparticipate
                            RIGHT JOIN events ON eventsparticipate.idEvent = events.idEvent
                            RIGHT JOIN users ON eventsparticipate.idUser = users.idUser
                            WHERE eventsparticipate.idUser = ?
                        `;

                        mysql.query(sql, [decoded.idUser], (error, results) => {
                            if (error) {
                                // TODO
                            }

                            return res.render('app', {
                                navbar: components.appNavbar,
                                addEvent: components.addEvent,
                                joinEvent: components.joinEvent,
                                eventsList: results
                            });
                        });

                        
                    });
                } catch (error) {
                    res.clearCookie('aperolandTicket');

                    return res.redirect('/');
                }
            } else {
                return res.redirect('/');
            }
        });

        app.get('/app/event/:uuid', (req, res, next) => {
            let sql = `
                SELECT * FROM events
                RIGHT JOIN 
            `;
            mysql.query(sql, async (error, results) => {})

            next();
        }, (req, res) => {
            if (req.cookies.aperolandTicket) {
                let sql = `
                    SELECT * FROM events
                    RIGHT JOIN users ON events.idUser = users.idUser
                    WHERE uuid = ?
                `;

                mysql.query(sql, req.params.uuid, (error, results) => {
                    if (error) {
                        // TODO
                    }

                    const eventInfo = results[0];

                    sql = `
                        SELECT * FROM eventsparticipate
                        RIGHT JOIN users ON eventsparticipate.idUser = users.idUser
                        WHERE idEvent = ?
                    `;

                    mysql.query(sql, eventInfo.idEvent, (error, results) => {
                        if (error) {
                            // TODO
                        }

                        return res.render('event', {
                            navbar: components.appNavbar,
                            eventName: eventInfo.name,
                            organizer: eventInfo.username,
                            participants: results,
                            latitude: eventInfo.latitude,
                            longitude: eventInfo.longitude,
                        });
                    });
                });
            }
        });
    }

    #admin(app) {}
}

module.exports = Routes;
