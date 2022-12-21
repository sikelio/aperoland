const express = require('express');

class Files {
    /**
     * Init the routes for public files
     * @param {function} app ExpressJS functions
     */
    init(app) {
        app.use('/libs', express.static('libs'));
        app.use('/pages', express.static('pages'));
    }
}

module.exports = Files;
