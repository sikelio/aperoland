const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const mysql = require('./mysql');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new SpotifyStrategy({
    clientID: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    callbackURL: `${process.env.URL}/auth/spotify/callback`
}, (accessToken, refreshToken, profile, done) => {
    let sql = `
        UPDATE users SET spotifyAccessToken = ?
        WHERE idUser = 1
    `;

    mysql.query(sql, [accessToken], (error, results) => {
        if (error) {
            console.error(error);
        }

        return done(null, profile);
    });
}));
