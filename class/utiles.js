const fs = require('fs');
const components = require('./components');

const Mail = require('./mail');
const mail = new Mail;

class Utiles {
    /**
     * Get the navbar following the user role
     * @param {string} role User role
     * @returns {element}
     */
    getNavbar(role) {
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
    checkStringNotNull(string) {
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
    checkEmail(email) {
        var regEx = /\S+@\S+\.\S+/;

        return regEx.test(email);
    }

    /**
     * Cases for each type of emails
     * @param {string} type Type of email
     * @param {any} to Recipents
     * @param {string} username Username
     * @param {object} data Email data
     * @returns {void}
     */
    sendMail(type, to, username, data) {
        switch (type) {
            case 'confirmationMail':
                mail.sendMailConfirmation(to, username, data);
                break;
            case 'passwordChanged':
                mail.sendPasswordWasReset(to, username, data);
                break;
            case 'accountInfoChanged':
                mail.sendAccountInfoHasChanged(to, username, data);
                break;
            case 'newCode':
                mail.sendNewCode(to, username, data);
                break;
            case 'sendInvites':
                mail.sendInvite(to, username, data);
                break;
        }
    }

    /**
     * Check if ics file exist
     * @param {object} data Data of event
     * @param {string} eventName Event name
     * @returns {void}
     */
    checkCalendarFile(data, eventName) {
        const Calendar = require('./calendar');
        const calendar = new Calendar;

        if (fs.existsSync(`calendar/${data[0].idEvent}-${eventName}.ics`) == false) {
            calendar.recreateFile(data[0]);
        }
    }

    /**
     * Recreate ics file of an event
     * @param {object} data Data of event
     * @returns {void}
     */
    recreateCalendarFile(data) {
        const Calendar = require('./calendar');
        const calendar = new Calendar;

        calendar.recreateFile(data);
    }

    /**
     * Create ics file for an event
     * @param {object} values Data of event
     * @param {string} date Date of the event
     * @param {string} time Time of the event
     * @param {number} idEvent ID of the event
     * @returns {void}
     */
    createCalendarFile(values, date, time, idEvent) {
        const Calendar = require('./calendar');
        const calendar = new Calendar;

        calendar.createFile(values, date, time, idEvent);
    }
}

module.exports = Utiles;
