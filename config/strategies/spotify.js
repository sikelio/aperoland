const SpotifyStrategy = require('passport-spotify').Strategy;

const spotifyStrategy = new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: `${process.env.URL}/auth/spotify/callback`
}, (accessToken, refreshToken, profile, done) => {
    return done(null, {
        accessToken: accessToken,
        refreshToken: refreshToken
    });
});

module.exports = spotifyStrategy;
