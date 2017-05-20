var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
  firstName: {
      type: String,
      required: [true, "First name required"]
  },
  lastName: {
      type: String,
      required: [true, "Last name required"]
  },
  email: {
      type:String,
      required: [true, "Please provide a unique email"],
      unique: [true, "That email is already taken"]
  },
  encryptedPass: {
      type: String,
      required: [true, "Password required"]
  }
});

userSchema.methods.validPassword = function(password, callback){
    bcrypt.compare(password, this.encryptedPass, function(err, valid){
        callback(valid);
    });
};

var User = mongoose.model("User", userSchema);

var poolDimensionsSchema = new mongoose.Schema({
  Length: {
    type: Number,
    required: [true, "Please enter length"]
  },
  Width: {
    type:Number,
    required: [true, "Please enter width"]
  },
  Spa: {
    type: String,
    enum: ['yes', 'no']
  },
  additionalServices: String,
  Total: Number
});

poolDimensionsSchema.methods.name = function () {
  return this.Length + this.Width + this.Spa + this.additionalServices + this.Total;
};

var aide = mongoose.model('poolAide', poolDimensionsSchema);

module.exports = {
  poolAide: aide,
  User: User
}
