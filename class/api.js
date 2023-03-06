require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const passport = require('passport');
const apiController = require('../controller/apiController');
const eventController = require('../controller/eventController');
const mysql = require('../config/mysql');
const spotify = require('../config/spotify');
require('../config/passport');

class API {
    /**
     * Creation of the api routes
     * @param {function} app ExpressJS functions
     * @returns {void}
     */
    init(app) {
        this.#geocodeApi(app);
        this.#spotifyApi(app);
        this.#spotityAuth(app);
    }

    /**
     * Creation of the geocode API route
     * When the client side js makes a resquest to this URL,
     * the server side js makes a request to the TomTom
     * geocode API
     * @param {function} app ExpressJS functions
     * @returns {array}
     */
    #geocodeApi(app) {
        // API route for searching address with TomTom API
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

    /**
     * Creation of the music searcging API route
     * When the client side js makes a resquest to this URL,
     * the server side js makes a request to the Spotify
     * API
     * @param {function} app ExpressJS functions
     * @returns {void}
     */
    #spotifyApi(app) {
        // API route for searching song with Spotify API
        app.get('/api/search-songs', async (req, res) => {
            let queryString = req.query.q;

            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                let sql = `
                    SELECT spotifyAccessToken, spotifyRefreshToken FROM users
                    WHERE idUser = ?
                `;

                mysql.query(sql, decoded.idUser, (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    spotify.setAccessToken(results[0].spotifyAccessToken);
                    spotify.setRefreshToken(results[0].spotifyRefreshToken);
                    spotify.searchTracks(queryString).then((data) => {
                        let dataObject = data.body.tracks.items

                        dataObject.forEach((element) => {
                            let artists = [];

                            element.artists.forEach((element) => {
                                artists.push(element.name);
                            });

                            element.artists = artists.join(', ');
                        });

                        return res.send(dataObject);
                    }, (err) => {
                        return res.sendStatus(err.statusCode);
                    });
                });
            } catch (error) {
                return res.redirect('/');
            }
        });

        app.post('/api/event/:idEvent/create-playlist', eventController.isOrganizer, async (req, res) => {
            const { playlistName } = req.body;

            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                let sql = `
                    SELECT spotifyAccessToken, spotifyRefreshToken FROM users
                    WHERE idUser = ?
                `;

                mysql.query(sql, decoded.idUser, (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    if (results.length == 0) {
                        return res.redirect(`/app/event/${req.params.idEvent}#playlist`);
                    }

                    spotify.setAccessToken(results[0].spotifyAccessToken);
                    spotify.setRefreshToken(results[0].spotifyRefreshToken);
                    spotify.createPlaylist(playlistName, {
                        description: `Test aperoland`,
                        public: true
                    }).then((data) => {
                        sql = `
                            INSERT INTO playlist SET ?
                        `;

                        mysql.query(sql, { idEvent: req.params.idEvent, playlistName: playlistName, id: data.body.id }, (error, results) => {
                            if (error) {
                                return res.redirect('/internal-error');
                            }

                            return res.redirect(`/app/event/${req.params.idEvent}#playlist`);
                        });
                    }, (err) => {
                        // TODO
                    });
                });
            } catch (error) {
                return res.redirect('/');
            }
        });

        app.post('/api/event/:idEvent/add-song-to-playlist', async (req, res) => {
            const { songs } = req.body;
            const formatSongs = songs.split(',');

            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );

                let sql = `
                    SELECT spotifyAccessToken, spotifyRefreshToken FROM users
                    WHERE idUser = ?
                `;
                
                mysql.query(sql, decoded.idUser, (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    spotify.setAccessToken(results[0].spotifyAccessToken);
                    spotify.setRefreshToken(results[0].spotifyRefreshToken);
                    
                    sql = `
                        SELECT id FROM playlist
                        WHERE idEvent = ?
                    `;

                    mysql.query(sql, req.params.idEvent, (error, results) => {
                        if (error) {
                            return res.redirect('/internal-error');
                        }

                        spotify.addTracksToPlaylist(results[0].id, formatSongs).then((data) => {
                            return res.redirect(`/app/event/${req.params.idEvent}#playlist`);
                        }, (err) => {
                            // TODO
                        })
                    });
                });
            } catch (error) {
                return res.redirect('/');
            }
        });
    }

    /**
     * Creation route for Spotify OAuth
     * @param {function} app ExpressJS functions
     * @returns {void}
     */
    #spotityAuth(app) {
        // Error callback route for Spotify OAuth
        app.get('/auth/error', (req, res) => {
            return res.send('/internal-error');
        });

        // Route for Spotify OAuth
        app.get('/auth/spotify', passport.authenticate('spotify', {
            scope: ['user-read-email', 'user-read-private', 'playlist-modify-public'],
            showDialog: true
        }));

        // Callback route for Spotify OAuth
        app.get('/auth/spotify/callback', passport.authenticate('spotify', {
            failureRedirect: '/auth/error',
        }), async (req, res) => {
            try {
                const decoded = await promisify(jwt.verify)(req.cookies.aperolandTicket,
                    process.env.JWT_SECRET
                );
                
                let sql = `
                    UPDATE users SET spotifyAccessToken = ?, spotifyRefreshToken = ?
                    WHERE idUser = ?
                `;

                mysql.query(sql, [req.user.accessToken, req.user.refreshToken, decoded.idUser], (error, results) => {
                    if (error) {
                        return res.redirect('/internal-error');
                    }

                    return res.redirect('/');
                });
            } catch (error) {
                return res.redirect('/');
            }
        });
    }
}

module.exports = API;
