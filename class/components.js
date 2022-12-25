const fs = require('fs');
const path = require('path');

// Navbars
exports.publicNavbar = fs.readFileSync(path.join(__dirname, '../components/public/navbar.html'));
exports.appNavbar = fs.readFileSync(path.join(__dirname, '../components/app/navbar.html'));
exports.adminNavbar = fs.readFileSync(path.join(__dirname, '../components/admin/navbar.html'));

// Modals
exports.cgu = fs.readFileSync(path.join(__dirname, '../components/public/modals/cgu.html'));
exports.addEvent = fs.readFileSync(path.join(__dirname, '../components/app/modals/addEvent.html'));
exports.joinEvent = fs.readFileSync(path.join(__dirname, '../components/app/modals/joinEvent.html'));
exports.addQuote = fs.readFileSync(path.join(__dirname, '../components/admin/modals/addQuote.html'));

// Errors
exports.notFound = path.join(__dirname, '../components/errors/404.html');
exports.internalError = path.join(__dirname, '../components/errors/500.html');
