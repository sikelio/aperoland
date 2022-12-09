const fs = require('fs');
const path = require('path');

// Navbars
exports.publicNavbar = fs.readFileSync(path.join(__dirname, '../components/public/navbar.html'));
exports.appNavbar = fs.readFileSync(path.join(__dirname, '../components/app/navbar.html'));
exports.adminNavbar = fs.readFileSync(path.join(__dirname, '../components/admin/navbar.html'));

// Modals
exports.addEvent = fs.readFileSync(path.join(__dirname, '../components/app/modals/addEvent.html'));