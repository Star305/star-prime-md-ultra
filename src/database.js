const fs = require('fs')
const path = require('path')

// Database structure
global.db = {
    users: {},
    groups: {},
    hit: {},
    sewa: [],
    premium: [],
    set: {},
    game: {
        suit: {},
        chess: {},
        chat_ai: {},
        menfes: {},
        tekateki: {},
        akinator: {},
        tictactoe: {},
        tebaklirik: {},
        kuismath: {},
        blackjack: {},
        tebaklagu: {},
        tebakkata: {},
        family100: {},
        susunkata: {},
        tebakbom: {},
        ulartangga: {},
        tebakkimia: {},
        caklontong: {},
        tebakangka: {},
        tebaknegara: {},
        tebakgambar: {},
        tebakbendera: {}
    }
}

// Load database if exists
const dbPath = path.join(__dirname, '../database.json')
if (fs.existsSync(dbPath)) {
    global.db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
}

// Save database function
global.saveDatabase = () => {
    fs.writeFileSync(dbPath, JSON.stringify(global.db, null, 2))
}

// Database functions used in main.js
module.exports = {
    cmdAdd: (hit) => {
        hit.total = (hit.total || 0) + 1
        global.saveDatabase()
    },
    cmdDel: (hit) => {
        hit.total = 0
        global.saveDatabase()
    },
    cmdAddHit: (hit, command) => {
        hit[command] = (hit[command] || 0) + 1
        global.saveDatabase()
    },
    addExpired: (data, array) => {
        array.push(data)
        global.saveDatabase()
    },
    getPosition: (id, array) => {
        return array.findIndex(x => x.id === id)
    },
    getExpired: (id, array) => {
        return array.find(x => x.id === id)
    },
    getStatus: (id, array) => {
        return array.find(x => x.id === id)
    },
    checkStatus: (id, array) => {
        return array.some(x => x.id === id)
    },
    getAllExpired: (array) => array,
    checkExpired: (array, sock) => {
        const now = Date.now()
        array.forEach((item, index) => {
            if (new Date(item.expired).getTime() < now) {
                if (sock && item.id.endsWith('@g.us')) {
                    sock.groupLeave(item.id).catch(() => {})
                }
                array.splice(index, 1)
            }
        })
        global.saveDatabase()
    }
}
