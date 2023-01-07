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

        /**
         * Creation of the method switch
         * Add a value to this
         */
        hbs.registerHelper('switch', function(value, options) {
            this.switch_value = value;
            return options.fn(this);
        });

        /**
         * Creation of the method case
         * If the value inserted with switch function return the value
         */
        hbs.registerHelper('case', function(value, options) {
            if (value == this.switch_value) {
                return options.fn(this);
            }
        });
    }
}

module.exports = HbsHelper;
