

const db=require('../common/dbaccess').db.connection


let crypto = require('crypto');

//////// HASH CONTRASEÑA 
let creepy = function (clear) {
    let salt='molibdeno'
    let hash = crypto.createHmac('sha256', salt);     // SHA256 at work
    hash.update(clear);
    return {
        salt: salt,
        hash: hash.digest('hex')
    };
};