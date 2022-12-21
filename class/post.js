const components = require('./components');
const mysql = require('./mysql');
const info = require('../package.json');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

class Post {
    /**
     * Init of all post routes
     * @param {function} app ExpressJS functions
     */
    init(app) {
        this.#public(app);
        this.#application(app);
        this.#admin(app);
    }

    /**
     * Creation of the public post routes
     * @param {function} app ExpressJS functions
     * @returns Page
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
                    // TODO
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
                        return res.render('register', {
                            error: 'Une erreur s\'est produite',
                            navbar: components.publicNavbar,
                            projectName: info.displayName,
                            currentYear: new Date().getFullYear()
                        });
                    }

                    return res.render('register', {
                        success: 'Utilisateur crée',
                        navbar: components.publicNavbar,
                        projectName: info.displayName,
                        currentYear: new Date().getFullYear()
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

                        const idUser = results[0].idUser;

                        const token = jwt.sign({ idUser }, process.env.JWT_SECRET, {
                            expiresIn: process.env.JWT_EXPIRES_IN
                        });

                        res.cookie('aperolandTicket', token);
                        res.redirect('/app/home');
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
     * @returns Page
     */
    #application(app) {
        app.post('/home/app/add-event', async (req, res) => {
            const { name, description, address, latitude, longitude } = req.body;

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
                    uuid: crypto.randomUUID()
                };

                mysql.query('INSERT INTO events SET ?', values, (error, results) => {
                    if (error) {
                        // TODO
                    }

                    const newValues = {
                        idEvent: results.insertId,
                        idUser: decoded.idUser
                    };

                    mysql.query('INSERT INTO eventsparticipate SET ?', newValues, (error, results) => {
                        if (error) {
                            // TODO
                        }

                        return res.redirect('/app/home');
                    });
                });
            } catch (error) {}
        });

        app.post('/home/app/join-event', async (req, res) => {
            const { uuid } = req.body;

            mysql.query('SELECT * FROM events WHERE uuid = ?', uuid, (error, results) => {
                if (error) {
                    // TODO
                }

                const idEvent = results[0].idEvent;

                if (!idEvent) {
                    return res.redirect('/app/home');
                }

                mysql.query('SELECT * FROM eventsparticipate WHERE idEvent = ?', idEvent, async (error, results) => {
                    if (error) {
                        // TODO
                    }

                    try {
                        const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                            process.env.JWT_SECRET
                        );

                        if (results[0].idUser == decoded.idUser) {
                            return res.redirect('/app/home');
                        }

                        const values = {
                            idEvent: results[0].idEvent,
                            idUser: decoded.idUser
                        };

                        mysql.query('INSERT INTO eventsparticipate SET ?', values, (error, results) => {
                            if (error) {
                                // TODO
                            }

                            return res.redirect(`/app/event/${uuid}`);
                        });
                    } catch (error) {
                        // TODO
                    }
                });
            });
        });
    }

    /**
     * Creation of the admin post routes
     * @param {function} app ExpressJS functions
     * @returns Page
     */
    #admin(app) {}
}

module.exports = Post;