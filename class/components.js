const fs = require('fs');
const path = require('path');

// Exports navbars
exports.publicNavbar = fs.readFileSync(path.join(__dirname, '../components/public/navbar.html'));
exports.appNavbar = fs.readFileSync(path.join(__dirname, '../components/app/navbar.html'));
exports.adminNavbar = fs.readFileSync(path.join(__dirname, '../components/admin/navbar.html'));

// Exports modals
exports.cgu = fs.readFileSync(path.join(__dirname, '../components/public/modals/cgu.html'));
exports.addEvent = fs.readFileSync(path.join(__dirname, '../components/app/modals/addEvent.html'));
exports.joinEvent = fs.readFileSync(path.join(__dirname, '../components/app/modals/joinEvent.html'));
exports.addQuote = fs.readFileSync(path.join(__dirname, '../components/admin/modals/addQuote.html'));
exports.confirmDeleteUser = fs.readFileSync(path.join(__dirname, '../components/admin/modals/confirmDeleteUser.html'));
exports.editEvent = fs.readFileSync(path.join(__dirname, '../components/app/modals/editEvent.html'));
exports.deleteUser = fs.readFileSync(path.join(__dirname, '../components/app/modals/deleteUser.html'));
exports.deleteEvent = fs.readFileSync(path.join(__dirname, '../components/app/modals/deleteEvent.html'));
exports.leaveEvent = fs.readFileSync(path.join(__dirname, '../components/app/modals/leaveEvent.html'));
exports.confirmDeleteEvent = fs.readFileSync(path.join(__dirname, '../components/admin/modals/confirmDeleteEvent.html'));
exports.regenerateCode = fs.readFileSync(path.join(__dirname, '../components/app/modals/regenerateCode.html'));
exports.addArticle = fs.readFileSync(path.join(__dirname, '../components/app/modals/addArticle.html'));

// Exports errors page
exports.forbidden = path.join(__dirname, '../components/errors/403.html');
exports.notFound = path.join(__dirname, '../components/errors/404.html');
exports.internalError = path.join(__dirname, '../components/errors/500.html');

// Exports others
exports.svg = fs.readFileSync(path.join(__dirname, '../components/public/svg.html'));
