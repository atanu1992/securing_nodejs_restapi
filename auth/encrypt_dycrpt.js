const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const password = 'secret_key';

function encrypt(text){
    // 'aes-256-ecb'
    var cipher = crypto.createCipher(algorithm, password);
    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  }
  
  function decrypt(text) {
    var cipher = crypto.createDecipher(algorithm, password);
    return cipher.update(text, 'hex', 'utf8') + cipher.final('utf8');
  }

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;