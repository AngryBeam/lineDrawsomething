const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
  },
  channelId: {
    type: String,
    require: true,
    minlength: 6
  },
  displayName: {
      type: String,
      required: true
  },
  pictureUrl: {
      type: String,
      required: true
  },
  quizName: {
    type: String
  },
  gamePlay: []

});

//UserSchema.index({ userId: 1, channelId: 1 });

/* UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email']);
}; */


UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
  //user.tokens.push({access, token});
  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.statics.findByChannelId = function (channelId) {
  var User = this;
  return User.find({
    'channelId': channelId
  });
};

UserSchema.statics.checkUserId = function (userId, channelId) {
  var User = this;
  return User.find({
    'userId': userId,
    'channelId': channelId
  });
};

UserSchema.pre('save', function (next) {
  var user = this;

    next();

});



var User = mongoose.model('User', UserSchema);

module.exports = {User}
