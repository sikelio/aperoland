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
                mysql.query('SELECT * FROM quotes ORDER BY RAND ( ) LIMIT 1', (error, results) => {
                    if (error) {
                        return res.redirect('/app/500');
                    }

                    return res.render('home', {
                        navbar: components.publicNavbar,
                        quote: results[0].quote
                    });
                });
            }
        });

        app.get('/favicon.ico', (req, res) => {
            res.sendFile(path.join(__dirname, '../pages/public/favicon.ico'));
        });

        app.get('/register', async (req, res) => {
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
                return res.render('register', {
                    navbar: components.publicNavbar,
                    projectName: info.displayName,
                    cgu: components.cgu,
                    currentYear: new Date().getFullYear()
                });
            }
        });

        app.get('/login', async (req, res) => {
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
                return res.render('login', {
                    navbar: components.publicNavbar,
                    projectName: info.displayName,
                    currentYear: new Date().getFullYear()
                });
            }
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
                            SELECT events.name, events.description, events.uuid, events.idUser, usr.username
                            FROM eventsparticipate
                            RIGHT JOIN events ON eventsparticipate.idEvent = events.idEvent
                            RIGHT JOIN users ON eventsparticipate.idUser = users.idUser
                            RIGHT JOIN users AS usr ON usr.idUser = events.idUser
                            WHERE eventsparticipate.idUser = ?
                        `;

                        mysql.query(sql, [decoded.idUser], (error, results) => {
                            if (error) {
                                return res.redirect('/app/500');
                            }

                            return res.render('app', {
                                navbar: this.#getNavbar(decoded.role),
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

                    mysql.query(sql, eventInfo.idEvent, async (error, results) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

                        try {
                            const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                                process.env.JWT_SECRET
                            );

                            return res.render('event', {
                                navbar: this.#getNavbar(decoded.role),
                                eventName: eventInfo.name,
                                organizer: eventInfo.username,
                                description: eventInfo.description,
                                participants: results,
                                latitude: eventInfo.latitude,
                                longitude: eventInfo.longitude,
                            });
                        } catch (error) {
                            return res.redirect('/app/500');
                        }
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

        app.get('/admin/quotes', async (req, res) => {
            if (req.cookies.aperolandTicket) {
                try {
                    const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                        process.env.JWT_SECRET
                    );

                    if (decoded.role != 'Admin') {
                        return res.redirect('/');
                    }

                    mysql.query('SELECT * FROM quotes', (error, results) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

                        return res.render('quotes', {
                            navbar: components.adminNavbar,
                            quotes: results,
                            addQuote: components.addQuote
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
            console.error(req);

            if (req.cookies.aperolandTicket) {
                try {
                    const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                        process.env.JWT_SECRET
                    );

                    if (decoded.role != 'Admin') {
                        return res.redirect('/');
                    }

                    let sql = `
                        SELECT events.*,
                        (SELECT COUNT(idUser) FROM eventsparticipate WHERE events.idEvent = eventsparticipate.idEvent)
                        AS attendees FROM events
                        RIGHT JOIN users ON events.idUser = users.idUser
                        WHERE events.idUser IS NOT NULL;
                    `;

                    // let sql = `
                    //     SELECT * FROM events
                    //     RIGHT JOIN users ON events.idUser = users.idUser
                    //     WHERE events.idUser IS NOT NULL;
                    // `;

                    mysql.query(sql, (error, results) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

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

    /**
     * Get the navbar following the user role
     * @param {string} role User role
     * @returns Navbar
     */
    #getNavbar(role) {
        let navbar;

        switch (role) {
            case 'User':
                navbar = components.appNavbar
                break;
            case 'Admin':
                navbar = components.adminNavbar;
                break;
        }

        return navbar;
    }
}

module.exports = Routes;
