const components = require('./components');
const mysql = require('../config/mysql');
const info = require('../package.json');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// const Mail = require('./mail');
// const mail = new Mail;

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
                    return res.redirect('/app/500');
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
                        return res.redirect('/app/500');
                    }

                    const idUser = results.insertId

                    let confirmationToken = jwt.sign({ idUser: idUser }, process.env.JWT_SECRET, {
                        expiresIn:process.env.JWT_RESET_EXPIRES_IN
                    });

                    mysql.query('UPDATE users SET confirmationToken = ? WHERE idUser = ?', [confirmationToken, idUser], (error, results) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

                        // mail.sendMailConfirmation(email, username, confirmationToken);

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

                        if (results[0].isConfirmed == 'Np') {
                            return res.render('login', {
                                warning: 'Votre compte n\'est pas confirmé. Veuillez le confirmer en cliquant sur le lien que vous avez reçu par mail.',
                                navbar: components.publicNavbar,
                                projectName: info.displayName,
                                currentYear: new Date().getFullYear()
                            });
                        }

                        const idUser = results[0].idUser;
                        const role = results[0].role;
                        const ip = req.socket.remoteAddress.split(':')[3];

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
                                console.error(error);
                                return res.redirect('/app/500');
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
     * @returns Page
     */
    #application(app) {
        app.post('/app/home/add-event', async (req, res) => {
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
                        return res.redirect('/app/500');
                    }

                    const newValues = {
                        idEvent: results.insertId,
                        idUser: decoded.idUser,
                        status: 'Organizer'
                    };

                    mysql.query('INSERT INTO eventsparticipate SET ?', newValues, (error, results) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

                        return res.redirect('/app/home');
                    });
                });
            } catch (error) {}
        });

        app.post('/app/home/join-event', async (req, res) => {
            const { uuid } = req.body;

            mysql.query('SELECT * FROM events WHERE uuid = ?', uuid, (error, results) => {
                if (error) {
                    return res.redirect('/app/500');
                }

                const idEvent = results[0].idEvent;

                if (!idEvent) {
                    return res.redirect('/app/home');
                }

                mysql.query('SELECT * FROM eventsparticipate WHERE idEvent = ?', idEvent, async (error, results) => {
                    if (error) {
                        return res.redirect('/app/500');
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
                                return res.redirect('/app/500');
                            }

                            return res.redirect(`/app/event/${uuid}`);
                        });
                    } catch (error) {
                        return res.redirect('/app/500');
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
                            return res.redirect('/app/500');
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
                        console.error('test');
                        return res.redirect('/admin/users');
                    }
        
                    mysql.query('DELETE FROM users WHERE idUser = ?', idUser, (error) => {
                        if (error) {
                            return res.redirect('/app/500');
                        }

                        return res.redirect('/admin/users');
                    });
                } catch (error) {
                    return res.redirect('/');
                }
            }
        });
    }
}

module.exports = Post;