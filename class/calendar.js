const fs = require('fs');
const ics = require('ics');

class Calendar {
    /**
     * Creation of ics file for the event
     * @param {object} info Event info
     * @param {string} date Event date
     * @param {string} time Event time
     * @param {number} idEvent Event ID
     * @returns {void}
     */
    createFile(info, date, time, idEvent) {
        const newDate = date.split('-');
        const newTime = time.split(':');
        const newTitle = info.name.replace(/\s/g, '-').toLowerCase();

        ics.createEvent({
            title: info.name,
            description: info.description,
            location: info.address,
            geo: { lat: Number(info.latitude), lon: Number(info.longitude) },
            start: [Number(newDate[0]), Number(newDate[1]), Number(newDate[2]), Number(newTime[0]), Number(newTime[1])],
            duration: { hours: Number(info.duration) }
        }, (error, value) => {
            if (error) {
                console.error(error);
            }

            this.#createFolder();
            fs.writeFileSync(`calendar/${idEvent}-${newTitle}.ics`, value);
        });
    }

    /**
     * Recreate file is deleted or does not exist
     * @param {object} info Event info
     * @returns {void}
     */
    recreateFile(info) {
        this.createFile(info, info.newDate, info.time, info.idEvent);
    }

    /**
     * Check if the calendar exist
     * @returns {void}
     */
    #createFolder() {
        if (fs.existsSync('calendar') == false) {
            fs.mkdirSync('calendar');
        }
    }
}

module.exports = Calendar;
