require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors')
const express = require('express');

const API = require('./api');
const Files = require('./files');
const Post = require('./post');
const Routes = require('./routes');
const api = new API;
const files = new Files;
const post = new Post;
const routes = new Routes;

class Express {
    #app = express();
    #port = process.env.EXPRESS_PORT;

    /**
     * Start point of ExpressJS web server
     */
    init() {
        files.init(this.#app);
        this.#app.set('view engine', 'hbs');
        this.#app.use(cors({
            origin: ['https://api-adresse.data.gouv.fr']
        }));
        this.#app.use(express.urlencoded({ extended: true }));
        this.#app.use(express.json());
        this.#app.use(cookieParser());
        post.init(this.#app);
        routes.init(this.#app);
        api.init(this.#app);
        this.#app.all('*', (req, res) => {
            res.redirect('/app/404');
        });
        this.#app.listen(this.#port, () => {
            console.log(`Aperoland launched on port ${this.#port}`);
        });
    }
}

module.exports = Express;
