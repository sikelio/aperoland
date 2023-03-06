const passport = require('passport');

const spotifyStrategy = require('./strategies/spotify');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(spotifyStrategy);
