const hbs = require('hbs');

class HbsHelper {
    /**
     * Creation of custom hbs helpers
     * @returns {void}
     */
    register() {
        /**
         * Creation of the method ifEquals
         * Check if value rendered is equal to a 'string / number / etc...'
         */
        hbs.registerHelper('ifEquals', function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        });
    }
}

module.exports = HbsHelper;
