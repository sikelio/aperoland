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
                            SELECT eventsparticipate.idEvent, eventsparticipate.idUser, events.name, events.address, events.description, users.username
                            FROM eventsparticipate
                            JOIN events ON eventsparticipate.idUser = events.idUser
                            JOIN users ON events.idUser = users.idUser
                            WHERE eventsparticipate.idUser = ?
                        `;

                        mysql.query(sql, [decoded.idUser], (error, results) => {
                            if (error) {
                                // TODO
                            }

                            console.error(results);

                            return res.render('app', {
                                navbar: components.appNavbar,
                                addEvent: components.addEvent,
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

        app.get('/app/event/:idEvent', (req, res) => {

        });
    }

    #admin(app) {}
}

module.exports = Routes;
