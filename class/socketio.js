require('dotenv').config();
const { Server } = require('socket.io');
const mysql = require('../config/mysql');

class SocketIO {
    #io;
    #users = [];
    #connectCounter = 0;

    /**
     * Initialization of socket messages
     * @param {function} server HTTP server instance
     * @returns {void}
     */
    init(server) {
        this.#io = new Server(server, {
            cors: {
                origin: process.env.URL,
                methods: ["GET", "POST"],
                transports: ['websocket', 'polling'],
            }
        });
        this.#io.on('connection', (socket) => {
            this.#connectCounter++;

            socket.on('joinRoom', ({ username, room }) => {
                const user = this.#userJoin(socket.id, username, room);

                socket.join(user.room);
            })

            socket.on('chat message', (msg) => {
                this.#chatBox(socket, msg);
            });

            socket.on('disconnect', () => { this.#connectCounter--; });
        });
    }

    /**
     * Method to add users to chat room
     * @param {number} id User ID
     * @param {string} username Username
     * @param {number} room Romm ID
     * @returns {object}
     */
    #userJoin(id, username, room) {
        const user = { id, username, room };

        this.#users.push(user);

        return user;
    }

    /**
     * Method to get user room ID
     * @param {number} id User ID
     * @returns {number}
     */
    #getCurrentUser(id) {
        return this.#users.find(user => user.id === id);
    }

    /**
     * Handle chatbox messages
     * @param {object} msg Data of message
     * @returns {message}
     */
    #chatBox(socket, msg) {
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

            const user = this.#getCurrentUser(socket.id);

            return this.#io.to(user.room).emit('chat message', {
                date: newDate,
                time: newTime,
                username: msg.username,
                msg: msg.msg
            });
        });
    }

    getActualConnected() {
        return this.#connectCounter;
    }
}

module.exports = SocketIO;