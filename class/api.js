require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const passport = require('passport');
const apiController = require('../controller/apiController');
const mysql = require('../config/mysql');
const spotify = require('../config/spotify');
require('../config/passport');

class API {
    /**
     * Creation of the api routes
     * @param {function} app ExpressJS functions
     */
    init(app) {
        this.#geocodeApi(app);
        this.#spotifyApi(app);
        this.#spotityAuth(app);
    }

    /**
     * Creation of the geocode get routes
     * When the client side js makes a resquest to this URL,
     * the server side js makes a request to the TomTom
     * geocode api
     * @param {function} app ExpressJS functions
     * @returns {array}
     */
    #geocodeApi(app) {
        app.get('/api/geocode', apiController.allowApiAccess, async (req, res) => {
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

    #spotifyApi(app) {
        app.get('/api/search-song', async (req, res) => {
            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                let sql = `
                    SELECT spotifyAccessToken FROM users
                    WHERE idUser = ?
                `;

                mysql.query(sql, decoded.idUser, (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    if (results.length == 0) {
                        // TODO
                    }

                    spotify.setAccessToken(results[0].spotifyAccessToken);
                    spotify.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then((data) => {
                            console.log(data.body);
                        }, (err) => {
                            console.error(err);
                        }
                    );
                });
            } catch (error) {
                return res.redirect('/');
            }
        });
    }

    #spotityAuth(app) {
        app.get('/auth/error', (req, res) => {
            return res.send('/internal-error');
        });

        app.get('/auth/spotify', passport.authenticate('spotify'));

        app.get('/auth/spotify/callback', passport.authenticate('spotify', {
            failureRedirect: '/auth/error',
        }), (req, res) => {
            res.redirect('/');
        });
    }
}

module.exports = API;
