const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const secret = require('../config').secret;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9@\.]+$/, 'is invalid'],
      // match: [/\S+@\S+\.\S+/, 'is invalid'],
      index: true,
    },
    bio: String,
    image: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    hash: String,
    salt: String,
  },
  { timestamps: true }
);

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.validPassword = function (password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  return this.hash === hash;
};

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

UserSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  // drinkjuide
  // return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTUwMzA1LCJ1c2VybmFtZSI6ImRyaW5ranVpY2UiLCJleHAiOjE2MjE3NDY2ODB9.PHilzBf--HKZs0IQaMZLMDnoFiU6N6u_tiiT2g-5fpQ'

  console.log('generateJWT() : ');

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000),
    },
    secret
  );
};

UserSchema.methods.toAuthJSON = function () {
  // console.log('UserSchema : toAuthJSON() : ');
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    bio: this.bio,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    // token:
    //   'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTUwMzA1LCJ1c2VybmFtZSI6ImRyaW5ranVpY2UiLCJleHAiOjE2MjE3NDY2ODB9.PHilzBf--HKZs0IQaMZLMDnoFiU6N6u_tiiT2g-5fpQ',
  };
};

UserSchema.methods.toProfileJSONFor = function (user) {
  // console.log('UserSchema : toProfileJSONFor() : ');
  return {
    username: this.username,
    bio: this.bio,
    image: this.image || 'https://static.productionready.io/images/smiley-cyrus.jpg',
    following: user ? user.isFollowing(this._id) : false,
  };
};

UserSchema.methods.isFavorite = function (articleId) {
  return this.favorites.findIndex((id) => id.toString() === articleId.toString()) >= 0;
};

UserSchema.methods.isFollowing = function (userId) {
  return this.following.findIndex((id) => id.toString() === userId.toString()) >= 0;
};

mongoose.model('User', UserSchema);
