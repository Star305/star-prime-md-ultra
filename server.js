const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys')
const pino = require('pino')
const { Boom } = require('@hapi/boom')

// ====================== YOUR HANDLER ======================
const Handler = require('./main')   // ← This connects to your main.js

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
                console.log('🔄 Connection closed, reconnecting...')
                startBot()
            } else {
                console.log('❌ Logged out. Delete the "session" folder and restart.')
            }
        }

        if (connection === 'open') {
            console.log('✅ STAR-PRIME-MD-ULTRA is now Online!')
        }
    })

    // ===================== PAIRING CODE =====================
    if (!sock.authState.creds.registered) {
        const phoneNumber = '2349060245012'   // ← CHANGE THIS TO YOUR NUMBER (without + or spaces)

        const code = await sock.requestPairingCode(phoneNumber)
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('🔥 YOUR PAIRING CODE:')
        console.log(`   ${code}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('1. Open WhatsApp → Linked Devices')
        console.log('2. Tap "Link a Device"')
        console.log('3. Enter the code above\n')
    }

    sock.ev.on('creds.update', saveCreds)

    // Load your main handler
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            await Handler(sock, chatUpdate.messages[0], chatUpdate)
        } catch (err) {
            console.log('Handler Error:', err)
        }
    })
}

startBot(
