// Import of dependencies
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors')
const express = require('express');

// Import of class
const API = require('./api');
const Files = require('./files');
const HbsHelpers = require('./hbshelpers');
const Post = require('./post');
const Routes = require('./routes');

// Instantiation of class
const api = new API;
const files = new Files;
const hbsHelpers = new HbsHelpers;
const post = new Post;
const routes = new Routes;

class Express {
    // Private variables
    #app = express();
    #port = process.env.EXPRESS_PORT;

    /**
     * Start point of ExpressJS web server
     * @returns {void}
     */
    init() {
        // Initialization of hbs helpers
        hbsHelpers.register();

        // Initialization of routes for public files
        files.init(this.#app);

        // Setting up the view engine to hbs
        this.#app.set('view engine', 'hbs');

        // Trusting the reverse proxy of nginx
        this.#app.set('trust proxy', true);

        // Allow request to the followings URL
        this.#app.use(cors({
            origin: ['https://api-adresse.data.gouv.fr']
        }));

        // Allow encoded URL
        this.#app.use(express.urlencoded({ extended: true }));

        // Middleware allow JSON
        this.#app.use(express.json());

        // Initialization of the cookieparser
        this.#app.use(cookieParser());

        // Initialization of posting routes
        post.init(this.#app);

        // Initialization of get routes
        routes.init(this.#app);

        // Initialization of api's routes
        api.init(this.#app);

        // Redirecting to 404 page of all unknown routess
        this.#app.all('*', (req, res) => {
            res.redirect('/not-found');
        });

        // Launch of the web server on specified port
        this.#app.listen(this.#port, () => {
            console.log(`Aperoland launched on port ${this.#port}`);
        });
    }
}

// Export class Express
module.exports = Express;
