const components = require('./components');
const eventController = require('../controller/eventController');
const accountController = require('../controller/accountController');
const adminController = require('../controller/adminController');
const mysql = require('../config/mysql');
const info = require('../package.json');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const Calendar = require('./calendar');
const Mail = require('./mail');
const mail = new Mail;

class Post extends Calendar {
    /**
     * Init of all post routes
     * @param {function} app ExpressJS functions
     * @returns {void}
     */
    init(app) {
        this.#public(app);
        this.#application(app);
        this.#admin(app);
    }

    /**
     * Creation of the public post routes
     * @param {function} app ExpressJS functions
     * @returns {void} Page
     */
    #public(app) {
        app.post('/register', (req, res) => {
            const { username, email, password, passwordConfirm, cgu } = req.body;

            if (cgu != 'on') {
                return res.render('register', {
                    warning: 'Vous devez accepter les CGU',
                    navbar: components.publicNavbar,
                    projectName: info.displayName,
                    cgu: components.cgu,
                    currentYear: new Date().getFullYear()
                });
            }

            mysql.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
                if (error) {
                    return res.redirect('/internal-error');
                }

                if (results.length > 0) {
                    return res.render('register', {
                        warning: 'Ce mail est déjà utilisé',
                        navbar: components.publicNavbar,
                        projectName: info.displayName,
                        currentYear: new Date().getFullYear()
                    });
                } else if (password !== passwordConfirm) {
                    return res.render('register', {
                        warning: 'Les mots de passes ne correspondent pas',
                        navbar: components.publicNavbar,
                        projectName: info.displayName,
                        currentYear: new Date().getFullYear()
                    });
                }

                let hashedPassword = await bcrypt.hash(password, 8);

                mysql.query('INSERT INTO users SET ?', { username: username, email: email, password: hashedPassword }, (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    const idUser = results.insertId

                    let confirmationToken = jwt.sign({ idUser: idUser }, process.env.JWT_SECRET, {
                        expiresIn:process.env.JWT_RESET_EXPIRES_IN
                    });

                    mysql.query('UPDATE users SET confirmationToken = ? WHERE idUser = ?', [confirmationToken, idUser], (error, results) => {
                        if (error) {
                            return res.redirect('/internal-error');
                        }

                        mail.sendMailConfirmation(email, username, confirmationToken);

                        return res.render('register', {
                            success: 'Utilisateur crée ! Confirmez votre compte en cliquant sur le lien reçu par mail.',
                            navbar: components.publicNavbar,
                            projectName: info.displayName,
                            currentYear: new Date().getFullYear()
                        });
                    });
                });
            });
        });

        app.post('/login', async (req, res) => {
            try {
                const { email, password } = req.body;

                if (!email || !password) {
                    return res.render('login', {
                        warning: 'Veuillez fournir un email et un mot de passe',
                        navbar: components.publicNavbar,
                        projectName: info.displayName,
                        currentYear: new Date().getFullYear()
                    });
                }

                mysql.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
                    try {
                        if (results.length == 0 || !(await bcrypt.compare(password, results[0].password))) {
                            return res.render('login', {
                                warning: 'Adresse mail ou Mot de passe incorrect !',
                                navbar: components.publicNavbar,
                                projectName: info.displayName,
                                currentYear: new Date().getFullYear()
                            });
                        }

                        if (results[0].isConfirmed == 'No') {
                            return res.render('login', {
                                warning: 'Votre compte n\'est pas confirmé. Veuillez le confirmer en cliquant sur le lien que vous avez reçu par mail.',
                                navbar: components.publicNavbar,
                                projectName: info.displayName,
                                currentYear: new Date().getFullYear()
                            });
                        }

                        const idUser = results[0].idUser;
                        const role = results[0].role;
                        const ip = req.ip;

                        const date = new Date(), day = date.getDate(), month = date.getMonth() + 1,
                        year = date.getFullYear(), hours = date.getHours(), minutes = date.getMinutes(),
                        seconds = date.getSeconds();

                        const lastConnectionDate = `${day}-${month}-${year}`;
                        const lastConnectionTime = `${hours}:${minutes}:${seconds}`;

                        let sql = `
                            UPDATE users SET
                            lastIp = ?, lastConnectionDate = ?, lastConnectionTime = ?
                            WHERE idUser = ?
                        `;

                        mysql.query(sql, [ip, lastConnectionDate, lastConnectionTime, idUser], (error, results) => {
                            if (error) {
                                return res.redirect('/internal-error');
                            }
                            
                            const token = jwt.sign({ idUser, role }, process.env.JWT_SECRET, {
                                expiresIn: process.env.JWT_EXPIRES_IN
                            });
    
                            res.cookie('aperolandTicket', token);
                            res.redirect('/app/home');
                        });
                    } catch (error) {
                        return res.render('login', {
                            warning: 'Une erreur s\'est produite',
                            navbar: components.publicNavbar,
                            projectName: info.displayName,
                            currentYear: new Date().getFullYear()
                        });
                    }
                });
            } catch (error) {
                return res.render('login', {
                    warning: 'Une erreur s\'est produite',
                    navbar: components.publicNavbar,
                    projectName: info.displayName,
                    currentYear: new Date().getFullYear()
                });
            }
        });
    }

    /**
     * Creation of the application post routes
     * @param {function} app ExpressJS functions
     * @returns {void} Page
     */
    #application(app) {
        // Post route for creation of an event
        app.post('/app/home/add-event', async (req, res) => {
            const { name, description, date, time, duration, address, latitude, longitude } = req.body;

            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                const values = {
                    idUser: decoded.idUser,
                    name: name,
                    address: address,
                    description: description,
                    latitude: latitude,
                    longitude: longitude,
                    uuid: crypto.randomUUID(),
                    date: date,
                    time: time,
                    duration: duration
                };

                mysql.query('INSERT INTO events SET ?', values, (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    const newValues = {
                        idEvent: results.insertId,
                        idUser: decoded.idUser,
                        status: 'Organizer'
                    };

                    mysql.query('INSERT INTO eventsparticipate SET ?', newValues, (error, results) => {
                        if (error) {
                            return res.redirect('/internal-error');
                        }

                        this.createFile(values, date, time, newValues.idEvent);

                        return res.redirect('/app/home');
                    });
                });
            } catch (error) {
                return res.redirect('/');
            }
        });

        // Post route for joining an event
        app.post('/app/home/join-event', async (req, res) => {
            const { uuid } = req.body;

            mysql.query('SELECT * FROM events WHERE uuid = ?', uuid, (error, results) => {
                if (error) {
                    return res.redirect('/internal-error');
                }

                if (results.length == 0) {
                    return res.redirect('/');
                }

                const idEvent = results[0].idEvent;

                if (!idEvent) {
                    return res.redirect('/app/home');
                }

                mysql.query('SELECT * FROM eventsparticipate WHERE idEvent = ?', idEvent, async (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    try {
                        const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                            process.env.JWT_SECRET
                        );

                        let sql = `
                            SELECT * FROM eventsparticipate WHERE idUser = ? AND idEvent = ?
                        `;

                        mysql.query(sql, [decoded.idUser, idEvent], (error, results) => {
                            if (error) {
                                return res.redirect('/internal-error');
                            }

                            if (results.length > 0) {
                                return res.redirect('/app/home');
                            }

                            const values = {
                                idEvent: idEvent,
                                idUser: decoded.idUser
                            };
    
                            mysql.query('INSERT INTO eventsparticipate SET ?', values, (error, results) => {
                                if (error) {
                                    return res.redirect('/internal-error');
                                }
    
                                return res.redirect(`/app/event/${idEvent}`);
                            });
                        });
                    } catch (error) {
                        return res.redirect('/');
                    }
                });
            });
        });

        // Post route for deleting an user form an event
        app.post('/app/event/delete-user', async (req, res) => {
            const { idUser, idEvent } = req.body;

            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                let sql = `
                    SELECT * FROM eventsparticipate
                    WHERE idEvent = ? AND idUser = ?
                `;

                mysql.query(sql, [idEvent, decoded.idUser], (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    if (results[0].status != 'Organizer') {
                        return res.redirect('/internal-error');
                    }

                    sql = `
                        DELETE FROM eventsparticipate
                        WHERE idUser = ? AND idEvent = ?
                    `;

                    mysql.query(sql, [idUser, idEvent], (error, results) => {
                        if (error) {
                            return res.redirect('/internal-error');
                        }

                        return res.redirect(`/app/event/${idEvent}`);
                    });
                });
            } catch (error) {
                return res.redirect('/');
            }
        });

        // Post route for editing an event
        app.post('/app/event/:idEvent/edit-event', eventController.isOrganizer, (req, res) => {
            let sql = `
                SELECT *, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM events
                WHERE idEvent = ?
            `;

            mysql.query(sql, req.params.idEvent, (error, results) => {
                return res.send(results[0]);
            });
        });

        // Post route for saving modification
        app.post('/app/event/:idEvent/edit-event/save', eventController.isOrganizer, eventController.deleteOldIcsFile, (req, res) => {
            let sql = `
                UPDATE events SET ? WHERE idEvent = ?
            `;

            mysql.query(sql, [req.body, req.params.idEvent], (error, results) => {
                if (error) {
                    return res.redirect('/internal-error');
                }

                sql = `
                    SELECT *, DATE_FORMAT(date, '%Y-%m-%d') AS newDate FROM events
                    WHERE idEvent = ?
                `;

                mysql.query(sql, req.params.idEvent, (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    this.recreateFile(results[0]);

                    return res.redirect(`/app/event/${req.params.idEvent}`)
                });
            });
        });

        // Post route for changing account info
        app.post('/app/account/change-info', accountController.isConnected, async (req, res) => {
            const { email, username } = req.body;

            if (this.#checkStringNotNull(username) == false) {
                return res.redirect('/app/account');
            }

            if (this.#checkEmail(email) == false) {
                return res.redirect('/app/account');
            }

            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                let sql = `
                    SELECT * FROM users
                    WHERE email = ?
                `;

                mysql.query(sql, email, (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    let checkResult = results;

                    sql = `
                        SELECT * FROM users
                        WHERE idUser = ?
                    `;

                    mysql.query(sql, decoded.idUser, (error, results) => {
                        if (error) {
                            return res.redirect('/internal-error');
                        }

                        if (checkResult.length > 0) {
                            return res.render('account', {
                                navbar: this.#getNavbar(decoded.role),
                                'error-account-info': 'Cet email est déja utilisé',
                                userData: {
                                    username: results[0].username,
                                    email: results[0].email,
                                }
                            });
                        }

                        const date = new Date(), day = date.getDate(), month = date.getMonth() + 1,
                        year = date.getFullYear(), hours = date.getHours(), minutes = date.getMinutes(),
                        seconds = date.getSeconds();

                        const fullDate = `${day}-${month}-${year}`;
                        const fullTime = `${hours}:${minutes}:${seconds}`;

                        const userInfo = {
                            email: results[0].email,
                            username: results[0].username,
                            newEmail: email,
                            newUsername: username,
                            ip: res.ip,
                            date: fullDate,
                            time: fullTime
                        };

                        sql = `
                            UPDATE users SET ? WHERE idUser = ?
                        `;

                        mysql.query(sql, [req.body, decoded.idUser], (error, results) => {
                            if (error) {
                                return res.redirect('/internal-error');
                            }

                            mail.sendAccountInfoHasChanged(userInfo.email, userInfo.username, userInfo);

                            return res.redirect('/app/account');
                        });
                    });
                });
            } catch (error) {
                return res.redirect('/');
            }
        });

        // Post route for changing password
        app.post('/app/account/change-password', accountController.isConnected, async (req, res) => {
            const { password, newPassword, newPasswordConfirm } = req.body;

            if (!password || !newPassword || !newPasswordConfirm) {
                // TODO
            }

            if (newPassword != newPasswordConfirm) {
                // TODO
            }

            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                    let sql = `
                        SELECT * FROM users
                        WHERE idUser = ?
                    `;

                mysql.query(sql, decoded.idUser, async (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    const date = new Date(), day = date.getDate(), month = date.getMonth() + 1,
                    year = date.getFullYear(), hours = date.getHours(), minutes = date.getMinutes(),
                    seconds = date.getSeconds();

                    const fullDate = `${day}-${month}-${year}`;
                    const fullTime = `${hours}:${minutes}:${seconds}`;

                    const mailInfo = {
                        to: results[0].email,
                        username: results[0].username,
                        ip: req.ip,
                        date: fullDate,
                        time: fullTime
                    };

                    try {
                        if (results.length == 0 || !(await bcrypt.compare(password, results[0].password))) {
                            // TODO
                        }

                        try {
                            let hashedPassword = await bcrypt.hash(newPassword, 8);

                            sql = `
                                UPDATE users SET password = ?
                                WHERE idUser = ?
                            `;

                            mysql.query(sql, [hashedPassword, decoded.idUser], (error, results) => {
                                if (error) {
                                    return res.redirect('/internal-error');
                                }

                                mail.sendPasswordWasReset(mailInfo.to, mailInfo.username, mailInfo);

                                return res.redirect('/app/account');
                            });
                        } catch (error) {
                            return res.redirect('/');
                        }
                    } catch (error) {
                        return res.redirect('/');
                    }
                });
            } catch (error) {
                return res.redirect('/');
            }
        });

        // Post route for leaving an event
        app.post('/app/event/:idEvent/leave-event', accountController.isConnected, eventController.isNotOrganizer, async (req, res) => {
            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                let sql = `
                    DELETE FROM eventsparticipate
                    WHERE idUser = ? AND idEvent = ?
                `;

                mysql.query(sql, [decoded.idUser, req.params.idEvent], (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    return res.redirect('/');
                });
            } catch (error) {
                return res.redirect('/');
            }
        });

        // Post route for deleting an event
        app.post('/app/event/:idEvent/delete-event', accountController.isConnected, eventController.isOrganizer, (req, res) => {
            let sql = `
                DELETE FROM events
                WHERE idEvent = ?
            `;

            mysql.query(sql, req.params.idEvent, (error, results) => {
                if (error) {
                    return res.redirect('/internal-error');
                }

                return res.redirect('/');
            });
        });

        // Post route for regenerating an event code
        app.post('/app/event/:idEvent/regenerate-code', accountController.isConnected, eventController.isOrganizer, (req, res) => {
            const uuid = crypto.randomUUID();

            let sql = `
                SELECT * FROM events
                WHERE uuid = ?
            `;

            mysql.query(sql, uuid, (error, results) => {
                if (error) {
                    return res.redirect('/internal-error');
                }

                sql = `
                    UPDATE events SET uuid = ?
                    WHERE idEvent = ?
                `;

                mysql.query(sql, [uuid, req.params.idEvent], (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    return res.redirect(`/app/event/${req.params.idEvent}`);
                });
            });
        });
    }

    /**
     * Creation of the admin post routes
     * @param {function} app ExpressJS functions
     * @returns {void} Page
     */
    #admin(app) {
        app.post('/admin/quotes/add-quote', async (req, res) => {
            if (req.cookies.aperolandTicket) {
                try {
                    const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                        process.env.JWT_SECRET
                    );

                    if (decoded.role != 'Admin') {
                        return res.redirect('/');
                    }

                    const { name, quote } = req.body

                    const values = {
                        name: name,
                        quote: quote
                    };

                    mysql.query('INSERT INTO quotes SET ?', values, (error, results) => {
                        if (error) {
                            return res.redirect('/internal-error');
                        }
    
                        return res.redirect('/admin/quotes');
                    });
                } catch (error) {
                    return res.redirect('/');
                }
            } else {
                return res.redirect('/');
            }
        });

        app.post('/admin/users/delete-user', async (req, res) => {
            if (req.cookies.aperolandTicket) {
                try {
                    const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                        process.env.JWT_SECRET
                    );

                    if (decoded.role != 'Admin') {
                        return res.redirect('/');
                    }

                    const { idUser } = req.body;

                    if (!idUser || isNaN(idUser)) {
                        return res.redirect('/admin/users');
                    }
        
                    mysql.query('DELETE FROM users WHERE idUser = ?', idUser, (error) => {
                        if (error) {
                            return res.redirect('/internal-error');
                        }

                        return res.redirect('/admin/users');
                    });
                } catch (error) {
                    return res.redirect('/');
                }
            }
        });

        app.post('/admin/events/get-events', adminController.isAdmin, (req, res) => {
            let sql = `
                SELECT E.idEvent, E.idUser, E.name, U.email, COUNT(EP.idUser) AS attendees, E.address,
                DATE_FORMAT(E.date, '%Y-%m-%d') AS date, E.time, E.duration, E.latitude, E.longitude
                FROM events AS E
                RIGHT JOIN users AS U ON E.idUser = U.idUser
                RIGHT JOIN (SELECT * FROM eventsparticipate) AS EP ON EP.idEvent = E.idEvent
                GROUP BY E.idEvent
            `;

            mysql.query(sql, (error, results) => {
                if (error) {
                    return res.redirect('/internal-error');
                }

                return res.send(results);
            });
        });

        app.post('/admin/events/:idEvent/delete-event', adminController.isAdmin, (req, res) => {
            let sql = `
                DELETE FROM events
                WHERE idEvent = ?
            `;

            mysql.query(sql, req.params.idEvent, (error, results) => {
                if (error) {
                    return res.redirect('/internal-error');
                }

                return res.redirect('/admin/events');
            });
        });
    }

    /**
     * Get the navbar following the user role
     * @param {string} role User role
     * @returns {element}
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

    /**
     * Check if string is not empty
     * @param {string} string String value
     * @returns {boolean}
     */
    #checkStringNotNull(string) {
        if (string) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if string is an email
     * @param {string} email Email string
     * @returns {boolean}
     */
    #checkEmail(email) {
        var regEx = /\S+@\S+\.\S+/;

        return regEx.test(email);
    }
}

module.exports = Post;