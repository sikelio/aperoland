require('dotenv').config();
const info = require('../package.json');
const transporter = require('../config/nodemailer');
var hbs = require('nodemailer-express-handlebars');
const path = require('path');

class Mail {
    /**
     * Send a mail to confirm an user account
     * The mail is not an static HTML file
     * The content if the mail is rendered with hbs
     * @param {string} to Recipient
     * @param {string} username Recipent Username
     * @returns {void}
     */
    sendMailConfirmation(to, username, confirmationToken) {
        const options = {
            viewEngine: {
                extname: '.hbs',
                layoutsDir: 'views/emails/',
                defaultLayout: 'confirmation',
                partialsDir: 'views/emails'
            },
            viewPath: 'views/emails',
            extName: '.hbs'
        };

        transporter.use('compile', hbs(options));
        transporter.sendMail({
            from: 'contact@sikelio.wtf',
            to: to,
            subject: 'Confirmation de votre compte',
            template: 'confirmation',
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '../pages/public/logo.png'),
                cid: 'logo'
            }],
            context: {
                username: username,
                baseUrl: `${process.env.URL}/confirm/${confirmationToken}`,
                projectName: info.displayName,
                currentYear: new Date().getFullYear(),
            }
        }, (err, info) => {
            if (err) {
                return '502';
            }

            return '200';
        });
    }

    /**
     * Send mail to account owner to inform
     * that his password has been changed
     * @param {string} to Recipient
     * @param {string} username Recipent Username
     * @param {object} data Data object
     * @returns {void}
     */
    sendPasswordWasReset(to, username, data) {
        const options = {
            viewEngine: {
                extname: '.hbs',
                layoutsDir: 'views/emails/',
                defaultLayout: 'password-reset',
                partialsDir: 'views/emails'
            },
            viewPath: 'views/emails',
            extName: '.hbs'
        };

        transporter.use('compile', hbs(options));
        transporter.sendMail({
            from: 'contact@sikelio.wtf',
            to: to,
            subject: 'Changement de mot de passe',
            template: 'password-reset',
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '../pages/public/logo.png'),
                cid: 'logo'
            }],
            context: {
                username: username,
                ip: data.ip,
                date: data.date,
                time: data.time,
                projectName: info.displayName,
                currentYear: new Date().getFullYear(),
            }
        }, (err, info) => {
            if (err) {
                return '502';
            }

            return '200';
        });
    }

    /**
     * Send mail to account owner to inform
     * that his account infos have been changed
     * @param {string} to Recipient
     * @param {string} username Recipent Username
     * @param {object} data Data object
     * @returns {void}
     */
    sendAccountInfoHasChanged(to, username, data) {
        const options = {
            viewEngine: {
                extname: '.hbs',
                layoutsDir: 'views/emails/',
                defaultLayout: 'account-info-change',
                partialsDir: 'views/emails'
            },
            viewPath: 'views/emails',
            extName: '.hbs'
        };

        transporter.use('compile', hbs(options));
        transporter.sendMail({
            from: 'contact@sikelio.wtf',
            to: to,
            subject: 'Changement de informations personnelles',
            template: 'account-info-change',
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, '../pages/public/logo.png'),
                cid: 'logo'
            }],
            context: {
                username: username,
                ip: data.ip,
                date: data.date,
                time: data.time,
                newEmail: data.newEmail,
                newUsername: data.newUsername,
                projectName: info.displayName,
                currentYear: new Date().getFullYear(),
            }
        }, (err, info) => {
            if (err) {
                return '502';
            }

            return '200';
        });
    }
}

module.exports = Mail;
