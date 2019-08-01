var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const Joi = require('@hapi/joi');
let check = require('../validations/auth');

var VerifyToken = require('./VerifyToken');

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
    if (!passwordIsValid) return res.status(401).send({ status: false, message: 'incorrect password' });

    // if user is found and password is valid
    // create a token
    var jwtToken = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 60*10 // expires in 10 minutes
    });
    var refreshToken = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 60*12 // expires in 12 minutes
    });

    Token.create({
      token: jwtToken,
      refreshtoken: refreshToken,
      user_id: user._id
    }, function(err, token) {
      if(err) {
        return res.status(500).send({status:"failed to create token", error: err});
      }
      return res.status(200).json({ 
        status: 'success',
        tokendetails: token, 
        message: 'login successfull'
      });
    });
  });

});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.get('/me', VerifyToken, function(req, res, next) {

  User.findById(req.userId, { password: 0 }, function (err, user) {
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

      var jwtToken = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 60*10 // expires in 10 minutes
      });
      var refreshToken = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 60*12 // expires in 12 minutes
      });
      Token.create({
        token: jwtToken,
        refreshtoken: refreshToken,
        user_id: user._id
      }, function(err, token) {
        if(err) {
          return res.status(500).send({status:"failed to create token", error: err});
        }
        return res.status(200).json({ 
          status: 'success',
          tokendetails: token, 
          message: 'User created successfully'
        });
      });
      
    });
    
});

module.exports = router;