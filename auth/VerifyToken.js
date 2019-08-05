var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
var Token = require('../token/token');
const encryption = require('./encrypt_dycrpt');

function verifyToken(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.headers['x-token'];
  var refreshtoken = req.headers['x-refresh-token'];
  if (!token || !refreshtoken) {
    return res.status(403).send({ status: false, message: 'No token provided' });
  }

  let verify_jwt_token = checkAuthToken(token);
  if(!verify_jwt_token){
      let verify_refresh_token = checkAuthToken(refreshtoken);
      if(!verify_refresh_token) {
        return res.status(403).send({ status: false, message: 'Unauthorized access' });
      }
  } else {

  }

}

checkHeaderAuthentication = (token,res) => {
  return jwt.verify(token, config.secret, function(err, decoded) {      
    if (err) 
      return res.status(401).send({ auth: false, message: 'Failed to authenticate token.', err: err });    
      Token.findOne({
        token: token
      }, function(err, token) {
        if(err) {
          return res.status(500).send({status:"invalid token", error: err});
        }
      });
      console.log('dd ',decoded.id);
    // if everything is good, save to request for use in other routes
    return decoded.id;
    // next();
  });
}

checkRefreshTokenAuthentication = (token,res) => {
  return jwt.verify(token, config.secret, function(err, decoded) {      
    if (err) 
      return res.status(401).send({ auth: false, message: 'Failed to authenticate token.', err: err });    
      Token.findOne({
        token: token
      }, function(err, token) {
        if(err) {
          return res.status(500).send({status:"invalid token", error: err});
        }
      });
      console.log('dhd ',decoded.id);
    // if everything is good, save to request for use in other routes
    return decoded.id;
    // next();
  });
}

function checkAuthToken(token) {
  jwt.verify(token, config.secret, function(err, decoded) {
    if(err) { return false; }
    else { 
      let check_exist = checkTokenExists(token);
      if(!check_exist) return false;
      else return true;
     }
  });
}

 checkTokenExists = (token) => {
  return Token.findOne({
    token: token
  }, function(err, token) {
    if(err) return false;
    else return true;
  });
}

// async function createToken(refreshtoken){
//   jwt.verify(refreshtoken, config.secret, function(err, decoded) {
//     let decryptedData = encryption.decrypt(String(decoded.loginId));
//   });
// }



module.exports = verifyToken;