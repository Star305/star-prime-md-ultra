const axios = require('axios')

async function TelegraPh(buffer) {
    // Dummy uploader - returns fake link
    return { url: 'https://telegra.ph/file/dummy.jpg' }
}

async function UguuSe(buffer) {
    return { url: 'https://uguu.se/file/dummy.png' }
}

module.exports = { TelegraPh, UguuSe }
