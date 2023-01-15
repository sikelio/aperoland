const axios = require('axios');

class API {
    /**
     * Creation of the api routes
     * @param {function} app ExpressJS functions
     */
    init(app) {
        this.#geocode(app);
    }

    /**
     * Creation of the geocode get routes
     * When the client side js makes a resquest to this URL,
     * the server side js makes a request to the french governement
     * geocode public api
     * @param {function} app ExpressJS functions
     * @returns {array}
     */
    #geocode(app) {
        app.get('/api/geocode', async (req, res) => {
            let queryString = req.query.q;
            let url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(queryString)}.json?key=${process.env.TOMTOM_API_KEY}`;

            await axios.get(url)
                .then((response) => {
                    let finalData = Array();

                    response.data.results.forEach(element => {

                        if (!element.address['coordinates']) {
                            element.address['coordinates'] = [element.position.lat, element.position.lon]
                        }

                        finalData.push(element.address);
                    });

                    res.send(finalData);
                })
                .catch((error) => {
                    res.send([]);
                });
        });
    }
}

module.exports = API;
