const TicTacToe = require('./tictactoe_class')

class GameTicTacToe {
    constructor() {
        this.rooms = {}
    }
    createRoom(id, playerX, playerO) {
        this.rooms[id] = new TicTacToe(playerX, playerO)
        return this.rooms[id]
    }
    getRoom(id) {
        return this.rooms[id]
    }
    deleteRoom(id) {
        delete this.rooms[id]
    }
}

module.exports = GameTicTacToe
