const { Server } = require('socket.io');
const mysql = require('../config/mysql');

class SocketIO {
    #io;

    /**
     * Initialization of socket messages
     * @param {function} server HTTP server instance
     * @returns {void}
     */
    init(server) {
        this.#io = new Server(server);
        this.#io.on('connection', (socket) => {
            socket.on('chat message', (msg) => {
                this.#chatBox(msg);
            });
        });
    }

    /**
     * Handle chatbox messages
     * @param {object} msg Data of message
     * @returns {message}
     */
    async #chatBox(msg) {
        let sql = `
            INSERT INTO chat SET ?
        `;

        const date = new Date(), day = date.getDate(), month = date.getMonth() + 1,
        year = date.getFullYear(), hours = date.getHours(), minutes = date.getMinutes(),
        seconds = date.getSeconds();
        const newDate = `${year}-${month}-${day}`;
        const newTime = `${hours}:${minutes}:${seconds}`;

        let values = {
            idEvent: msg.idEvent,
            date: newDate,
            time: newTime,
            username: msg.username,
            message: msg.msg
        };

        mysql.query(sql, values, (error, results) => {
            if (error) {
                console.error(error);
            }

            return this.#io.emit('chat message', {
                date: newDate,
                time: newTime,
                username: msg.username,
                msg: msg.msg
            });
        });
    }
}

module.exports = SocketIO;