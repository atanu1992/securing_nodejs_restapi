var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  token: String,
  refreshtoken: String,
  user_id: String,
  loginTime: { type : Date, default: Date.now }
});
mongoose.model('Token', UserSchema);

module.exports = mongoose.model('Token');