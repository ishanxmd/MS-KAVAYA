const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "S4AllQLB#y_0BbyNBYJNjW51nDubt8Rljj2dPJB14nZqA5Y2YLu4",
ALIVE_IMG: process.env.ALIVE_IMG || "https://files.catbox.moe/d0z6ym.JPG",
ALIVE_MSG: process.env.ALIVE_MSG || "*Hello👋 ISHAN-MD Is Alive Now😍*",
BOT_OWNER: '94761638379',  // Replace with the owner's phone number
‎AUTO_STATUS_SEEN‎: "true",
AUTO_STATUS_REACT: "true",

};
