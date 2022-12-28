const express = require('express');

class Files {
    /**
     * Init the routes for public files
     * @param {function} app ExpressJS functions
     */
    init(app) {
        // The user can access files located in the libs folder throw the /libs URL
        app.use('/libs', express.static('libs'));

        // The user can access files located in the pages folder throw the /pages URL
        app.use('/pages', express.static('pages'));
    }
}

module.exports = Files;
