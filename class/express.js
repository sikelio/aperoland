// Import of dependencies
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors')
const express = require('express');
const http = require('http');

// Import of class
const API = require('./api');
const Files = require('./files');
const HbsHelpers = require('./hbshelpers');
const Post = require('./post');
const Routes = require('./routes');
const SocketIO = require('./socketio');

// Instantiation of class
const api = new API;
const files = new Files;
const hbsHelpers = new HbsHelpers;
const post = new Post;
const routes = new Routes;
const socketIO = new SocketIO;

const app = express();
const server = http.createServer(app);

class Express {
    // Private variables
    #port = process.env.EXPRESS_PORT;

    /**
     * Start point of ExpressJS web server
     * @returns {void}
     */
    init() {
        // Initialization of socket io server
        socketIO.init(server);

        // Initialization of hbs helpers
        hbsHelpers.register();

        // Initialization of routes for public files
        files.init(app);

        // Setting up the view engine to hbs
        app.set('view engine', 'hbs');

        // Trusting the reverse proxy of nginx
        app.set('trust proxy', true);

        // Allow request to the followings URL
        app.use(cors({
            origin: ['https://api.tomtom.com']
        }));

        // Allow encoded URL and max size upload
        app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        // Middleware allow JSON
        app.use(express.json());

        // Initialization of the cookieparser
        app.use(cookieParser());

        // Initialization of posting routes
        post.init(app);

        // Initialization of get routes
        routes.init(app);

        // Initialization of api's routes
        api.init(app);

        // Redirecting to 404 page of all unknown routess
        app.all('*', (req, res) => {
            res.redirect('/not-found');
        });

        // Launch of the web server on specified port
        server.listen(this.#port, () => {
            console.log(`Aperoland launched on port ${this.#port}`);
        });
    }
}

// Export class Express
module.exports = Express;
