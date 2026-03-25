const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys')
const pino = require('pino')
const { Boom } = require('@hapi/boom')

// Load settings
require('./settings')

// Load your main handler
const Handler = require('./main')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session')
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['STAR-PRIME-MD-ULTRA', 'Chrome', '4.0.0'],
    })

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            if (reason !== DisconnectReason.loggedOut) {
                console.log('🔄 Connection closed. Reconnecting...')
                startBot()
            } else {
                console.log('❌ Logged out. Delete session folder and restart.')
            }
        }

        if (connection === 'open') {
            console.log('✅ STAR-PRIME-MD-ULTRA is now Online!')
        }
    })

    // ===================== PAIRING CODE =====================
    if (!sock.authState.creds.registered) {
        const phoneNumber = '2349060245012'   // ← Your new number

        const code = await sock.requestPairingCode(phoneNumber)
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('🔥 YOUR PAIRING CODE:')
        console.log(`   ${code}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('1. Open WhatsApp on your phone')
        console.log('2. Go to Linked Devices')
        console.log('3. Tap "Link a Device"')
        console.log('4. Enter the code above\n')
    }

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0]
            if (!m.message) return
            await Handler(sock, m, chatUpdate, sock.store || {}, {})
        } catch (err) {
            console.log('Handler Error:', err)
        }
    })
}

startBot()
