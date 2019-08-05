var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const Joi = require('@hapi/joi');
var config = require('../config');
let check = require('../validations/auth');
const encryption = require('./encrypt_dycrpt');

var verify_token = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');
var Token = require('../token/token');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

router.post('/login', function(req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    
    if (!user) return res.status(404).send('No user found.');
    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) 
      return res.status(401).send({ status: false, message: 'incorrect password' });
    
      let time = new Date().getTime();
      let loginId = Math.random().toString(36).substring(2, 15) + String(time).substring(2,10) + Math.random().toString(36).substring(2, 15);

    // create a token
    let encryptedId = encryption.encrypt(String(user._id));
    var jwtToken = jwt.sign({ id: encryptedId }, config.secret, {
      expiresIn: 60*5 // expires in 10 minutes
    });
    
    let encryptedLoginId = encryption.encrypt(String(verify_token.uniqueString));
    var refreshToken = jwt.sign({ id: encryptedLoginId }, config.secret, {
      expiresIn: 60*6 // expires in 12 minutes
    });


    Token.create({
      token: jwtToken,
      refreshtoken: refreshToken,
      loginId : loginId,
      user_id: user._id,
      loginTime: (new Date().getTime()),
    }, function(err, token) {
      if(err) {
        return res.status(500).send({status:"failed to create token", error: err});
      }
      return res.status(200).json({ 
        status: 'success',
        token: token.token,
        refreshToken: token.refreshtoken, 
        message: 'login successfull'
      });
    });
  });

});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.get('/me', verify_token, function(req, res, next) {
  let decryptedData = encryption.decrypt(String(req.userId));
  User.findById(Object(decryptedData), { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });

});

router.post('/register', function(req, res) {
  const data = req.body;
  let validate = check.login(Joi, data);
  if(validate !== undefined) {
    return res.status(422).json(validate);
  }
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    User.create({
      name : req.body.name,
      email : req.body.email,
      password : hashedPassword
    },function (err, user) {
      if(err) {
        return res.status(500).send("There was a problem registering the user.");
      }
    
        return res.status(200).json({ 
          status: 'success',
          message: 'User created successfully'
        });
    });
});

module.exports = router;