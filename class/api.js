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
            let url = 'https://api-adresse.data.gouv.fr/search/?q=' + encodeURIComponent(queryString);

            await axios.get(url)
                .then((response) => {
                    let finalData = Array();

                    response.data.features.forEach(element => {
                        if (!element.properties['coordinates']) {
                            element.properties['coordinates'] = [element.geometry.coordinates[1], element.geometry.coordinates[0]]
                        }

                        finalData.push(element.properties);
                    });

                    res.send(finalData)
                })
                .catch((error) => {
                    res.send([]);
                });
        });
    }
}

module.exports = API;
