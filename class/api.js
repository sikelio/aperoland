const axios = require('axios');

class API {
    init(app) {
        this.#geocode(app);
    }

    #geocode(app) {
        app.get('/api/geocode', (req, res) => {
            let queryString = req.query.q;
            let url = 'https://api.github.com/search/repositories?q=' + encodeURIComponent(queryString);

            axios.get(url)
                .then((response) => {
                    res.status(200).json(response.items)
                })
                .catch((error) => {

                })
                .then((test) => {
                    console.error(test);
                })
        });
    }
}

module.exports = API;
