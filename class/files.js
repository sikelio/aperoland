const express = require('express');

class Files {
    init(app) {
        app.use('/libs', express.static('libs'));
        app.use('/pages', express.static('pages'));
    }
}

module.exports = Files;
