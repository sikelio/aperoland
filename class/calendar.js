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

        ics.createEvent({
            title: info.name,
            description: info.description,
            location: info.address,
            geo: { lat: Number(info.latitude), lon: Number(info.longitude) },
            start: [Number(newDate[0]), Number(newDate[1]), Number(newDate[2]), Number(newTime[0]), Number(newTime[1])],
            duration: { minutes: Number(info.duration) }
        }, (error, value) => {
            if (error) {
                console.error(error);
            }

            fs.writeFileSync(`calendar/${idEvent}-${info.name}.ics`, value);
        });
    }
}

module.exports = Calendar;
