var express = require('express');
var app = express();
var db = require('./db');
var router = express.Router();
global.__root   = __dirname + '/'; 

app.all('/', function (req, res) {
  res.status(404).json({status : 404, message : 'Invalid request' });
});

app.get('/api', function (req, res) {
  res.status(405).json({code : 405, message : 'Unknown method' });
});

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, x-token, x-refresh-token, content-type, Authorization');
  next();
});

var UserController = require(__root + 'user/UserController');
app.use('/api/users', UserController);

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);


app.all('*', function (req, res) {
  res.status(405).json({code : 405, message : 'Unknown method' });
});

module.exports = app;