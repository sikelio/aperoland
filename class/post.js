const components = require('./components');
const mysql = require('./mysql');
const info = require('../package.json');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

class Post {
    init(app) {
        this.#public(app);
        this.#application(app);
        this.#admin(app);
    }

    #public(app) {
        app.post('/register', (req, res) => {
            const { username, email, password, passwordConfirm } = req.body;

            mysql.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
                if (error) {
                    console.log(error);
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
                    if (!results || !(await bcrypt.compare(password, results[0].password))) {
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

    #application(app) {
        app.post('/home/app/add-event', async (req, res) => {
            const { name, description, address } = req.body;

            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                const values = {
                    idUser: decoded.idUser,
                    name: name,
                    address: address,
                    description: description,
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
    }

    #admin(app) {}
}

module.exports = Post;