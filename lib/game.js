const { rdGame, iGame, tGame } = require('../src/game_helper')

module.exports = {
    rdGame: (game, chat) => game[chat] ? true : false,
    iGame: (game, chat) => {
        let id = Object.keys(game).find(key => key.includes(chat))
        return id ? id : null
    },
    tGame: (game, chat) => game[chat] || null,

    gameSlot: async (qasim, m, db) => {
        // Simple slot game
        const symbols = ['🍒', '🍋', '🍉', '⭐', '7️⃣']
        const result = Array(3).fill().map(() => symbols[Math.floor(Math.random() * symbols.length)])
        const win = result[0] === result[1] && result[1] === result[2]
        await m.reply(`🎰 *SLOT MACHINE*\n\n\( {result.join(' | ')}\n\n \){win ? '🎉 YOU WIN! +5000 Money' : '❌ Try again'}`)
        if (win) db.users[m.sender].money += 5000
    },

    gameCasinoSolo: async (qasim, m, db) => {
        const bet = 1000
        const winChance = Math.random() > 0.5
        if (winChance) {
            db.users[m.sender].money += bet * 2
            await m.reply(`🎲 Casino Win! +${bet * 2} Money`)
        } else {
            db.users[m.sender].money -= bet
            await m.reply(`🎲 Casino Lose! -${bet} Money`)
        }
    },

    gameSamgongSolo: async () => { /* Placeholder */ },
    gameMerampok: async (m, db) => {
        const amount = Math.floor(Math.random() * 5000) + 1000
        db.users[m.sender].money += amount
        await m.reply(`🪙 You robbed successfully! +${amount} Money`)
    },
    gameBegal: async (qasim, m, db) => {
        const amount = Math.floor(Math.random() * 3000) + 500
        db.users[m.sender].money += amount
        await m.reply(`🏃‍♂️ Begal success! +${amount} Money`)
    },

    daily: async (m, db) => {
        const lastClaim = db.users[m.sender].lastClaim || 0
        if (Date.now() - lastClaim < 86400000) return m.reply('You already claimed today!')
        db.users[m.sender].money += 5000
        db.users[m.sender].limit += 10
        db.users[m.sender].lastClaim = Date.now()
        await m.reply('✅ Daily claim successful!\n+5000 Money & +10 Limit')
    },

    buy: async (m, args, db) => {
        if (!args[0]) return m.reply('Example: buy limit 10')
        // Simple buy logic
        const price = 1000 * parseInt(args[1] || 1)
        if (db.users[m.sender].money < price) return m.reply('Not enough money!')
        db.users[m.sender].money -= price
        db.users[m.sender].limit += parseInt(args[1] || 1)
        await m.reply(`✅ Bought ${args[1] || 1} limit!`)
    },

    setLimit: (limit, user, db) => { db.users[user].limit = limit },
    addLimit: (amount, user, db) => { db.users[user].limit += amount },
    addMoney: (amount, user, db) => { db.users[user].money += amount },
    setMoney: (amount, user, db) => { db.users[user].money = amount },
    transfer: async (m, args, db) => {
        if (!args[0] || !args[1]) return m.reply('Example: transfer @user 1000')
        const target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        const amount = parseInt(args[1])
        if (db.users[m.sender].money < amount) return m.reply('Not enough money!')
        db.users[m.sender].money -= amount
        if (!db.users[target]) db.users[target] = { money: 0, limit: 0 }
        db.users[target].money += amount
        await m.reply(`✅ Transferred \( {amount} to @ \){target.split('@')[0]}`)
    },

    Blackjack: () => {},
    SnakeLadder: class {
        constructor(data) { Object.assign(this, data) }
        rollDice() { return Math.floor(Math.random() * 6) + 1 }
        drawBoard() { return Buffer.from([]) }
    }
}
