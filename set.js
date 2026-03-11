const fs = require('fs-extra');
const { Sequelize } = require('sequelize');
if (fs.existsSync('set.env'))
    require('dotenv').config({ path: __dirname + '/set.env' });
const path = require("path");
const databasePath = path.join(__dirname, './database.db');
const DATABASE_URL = process.env.DATABASE_URL === undefined
    ? databasePath
    : process.env.DATABASE_URL;

module.exports = { 
    // ============ SESSION ============
    session: process.env.SESSION_ID || '',
    
    // ============ BOT SETTINGS ============
    PREFIXE: process.env.PREFIX || ".",
    OWNER_NAME: process.env.OWNER_NAME || "Ibrahim Adams",
    NUMERO_OWNER: process.env.NUMERO_OWNER || "255760164530", // 🔴 WEKA NAMBA YAKO HAPA
    BOT: process.env.BOT_NAME || 'BMW_MD',
    MODE: process.env.PUBLIC_MODE || "yes",
    PM_PERMIT: process.env.PM_PERMIT || 'yes',
    ETAT: process.env.PRESENCE || '1',          // 1=online, 2=typing, 3=recording
    DP: process.env.STARTING_BOT_MESSAGE || "yes",
    
    // ============ AUTO STATUS SETTINGS ============
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "yes",
    AUTO_REACT_STATUS: process.env.AUTO_REACT_STATUS || 'yes',  // 🔥 HII NI MUHIMU KWA AUTO LIKE
    AUTO_DOWNLOAD_STATUS: process.env.AUTO_DOWNLOAD_STATUS || 'no',
    
    // ============ BOT PROFILE ============
    URL: process.env.BOT_MENU_LINKS || 'https://telegra.ph/file/17c83719a1b40e02971e4.jpg',
    
    // ============ WARN SYSTEM ============
    WARN_COUNT: process.env.WARN_COUNT || '3',
    
    // ============ ANTI-DELETE SETTINGS ============
    ANTIDELETE2: process.env.ANTIDELETE2 || "yes",
    ANTIDELETE1: process.env.ANTIDELETE1 || "yes",
    ADM: process.env.ANTI_DELETE_MESSAGE || 'no',
    
    // ============ HEROKU SETTINGS ============
    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME || '',
    HEROKU_APY_KEY: process.env.HEROKU_APY_KEY || '',
    
    // ============ DATABASE ============
    DATABASE_URL,
    DATABASE: DATABASE_URL === databasePath
        ? "postgresql://postgres:bKlIqoOUWFIHOAhKxRWQtGfKfhGKgmRX@viaduct.proxy.rlwy.net:47738/railway" 
        : DATABASE_URL,
};

console.log("✅ Configuration Loaded");
console.log(`📱 Prefix: ${module.exports.PREFIXE}`);
console.log(`👤 Owner: ${module.exports.OWNER_NAME}`);
console.log(`📞 Owner Number: ${module.exports.NUMERO_OWNER}`);
console.log(`🔰 Mode: ${module.exports.MODE === 'yes' ? 'Public' : 'Private'}`);
console.log(`❤️ Auto React Status: ${module.exports.AUTO_REACT_STATUS}`);

let fichier = require.resolve(__filename);
fs.watchFile(fichier, () => {
    fs.unwatchFile(fichier);
    console.log(`🔄 Updating ${__filename}`);
    delete require.cache[fichier];
    require(fichier);
});
