require('dotenv').config();
const components = require('./components');
const info = require('../package.json');
const mysql = require('./mysql');
const jwt = require('jsonwebtoken');
const path = require('path');
const { promisify } = require('util');

class Routes {
    /**
     * Init of all types of routes
     * @param {function} app ExpressJS functions
     */
    init(app) {
        this.#public(app);
        this.#error(app);
        this.#application(app);
        this.#admin(app);
    }

    /**
     * Creation of the public routes
     * @param {function} app ExpressJS functions
     * @returns Page
     */
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

    /**
     * Creation of the errors code routes
     * @param {function} app ExpressJS functions
     * @returns Page
     */
    #error(app) {
        app.get('/app/404', (req, res) => {
            return res.sendFile(components.notFound);
        });

        app.get('/app/500', (req, res) => {
            return res.sendFile(components.internalError);
        });
    }

    /**
     * Creation of the application routes
     * @param {function} app ExpressJS functions
     * @returns Page
     */
    #application(app) {
        app.get('/app/home', async (req, res) => {
            if (req.cookies.aperolandTicket) {
                try {
                    const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                        process.env.JWT_SECRET
                    );

                    mysql.query('SELECT username FROM users WHERE idUser = ?', [decoded.idUser], (error, results) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

                        const sql = `
                            SELECT events.name, users.username, events.description, events.uuid FROM eventsparticipate
                            RIGHT JOIN events ON eventsparticipate.idEvent = events.idEvent
                            RIGHT JOIN users ON eventsparticipate.idUser = users.idUser
                            WHERE eventsparticipate.idUser = ?
                        `;

                        mysql.query(sql, [decoded.idUser], (error, results) => {
                            if (error) {
                                return res.redirect('/app/500');
                            }

                            let navbar;

                            switch (decoded.role) {
                                case 'User':
                                    navbar = components.appNavbar
                                    break;
                                case 'Admin':
                                    navbar = components.adminNavbar;
                                    break;
                            }

                            return res.render('app', {
                                navbar: navbar,
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
                SELECT eventsparticipate.idUser FROM events
                RIGHT JOIN eventsparticipate ON events.idEvent = eventsparticipate.idEvent
                WHERE events.uuid = ?
            `;

            mysql.query(sql, req.params.uuid, async (error, results) => {
                if (error) {
                    return res.redirect('/app/500');
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
                        return res.status(403).redirect('/app/403');
                    }

                    return next();
                } catch (error) {
                    return res.redirect('/');
                }
            });
        }, (req, res) => {
            if (req.cookies.aperolandTicket) {
                let sql = `
                    SELECT * FROM events
                    RIGHT JOIN users ON events.idUser = users.idUser
                    WHERE uuid = ?
                `;

                mysql.query(sql, req.params.uuid, (error, results) => {
                    if (error) {
                        return res.redirect('/app/500');
                    }

                    const eventInfo = results[0];

                    sql = `
                        SELECT * FROM eventsparticipate
                        RIGHT JOIN users ON eventsparticipate.idUser = users.idUser
                        WHERE idEvent = ?
                    `;

                    mysql.query(sql, eventInfo.idEvent, (error, results) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

                        return res.render('event', {
                            navbar: components.appNavbar,
                            eventName: eventInfo.name,
                            organizer: eventInfo.username,
                            description: eventInfo.description,
                            participants: results,
                            latitude: eventInfo.latitude,
                            longitude: eventInfo.longitude,
                        });
                    });
                });
            }
        });
    }

    /**
     * Creation of the admin routes
     * @param {function} app ExpressJS functions
     * @returns Page
     */
    #admin(app) {
        app.get('/admin/users', async (req, res) => {
            if (req.cookies.aperolandTicket) {
                try {
                    const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                        process.env.JWT_SECRET
                    );

                    if (decoded.role != 'Admin') {
                        return res.redirect('/');
                    }

                    mysql.query('SELECT * FROM users WHERE role = \'User\'', (error, results) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

                        return res.render('users', {
                            navbar: components.adminNavbar,
                            users: results
                        });
                    });
                } catch (error) {
                    res.redirect('/')
                }
            } else {
                return res.redirect('/');
            }
        });

        app.get('/admin/events', async (req, res, next) => {
            if (req.cookies.aperolandTicket) {
                try {
                    const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                        process.env.JWT_SECRET
                    );

                    if (decoded.role != 'Admin') {
                        return res.redirect('/');
                    }

                    let sql = `
                        SELECT * FROM events
                        RIGHT JOIN users ON events.idUser = users.idUser
                        WHERE events.idUser IS NOT NULL;
                    `;

                    mysql.query(sql, (error, results) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

                        let events = Array();

                        results.forEach((element) => {
                            console.error(element);

                            sql = `
                                SELECT COUNT (idUser) FROM eventsparticipate
                                WHERE idEvent = ?
                            `;

                            mysql.query(sql, [element.idEvent], (error, results) => {
                                if (error) {
                                    return res.redirect('/app/500');
                                }

                                element.attendees = results[0]['COUNT (idUser)'];
                                events.push(element);                                
                            });
                        });

                        console.error(events);

                        return res.render('events', {
                            navbar: components.adminNavbar,
                            events: results
                        });
                    });
                } catch (error) {
                    res.redirect('/')
                }
            } else {
                return res.redirect('/');
            }
        });
    }
}

module.exports = Routes;
