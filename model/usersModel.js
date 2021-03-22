const mongoose = require('mongoose');
const shortid = require('shortid');

const Users = mongoose.model(
  'users',
  new mongoose.Schema({
    id: { type: String, default: shortid.generate },
    email: String,
    createdAt: String,
    updatedAt: String,
    username: String,
    password: String,
    bio: String,
    image: String,
    token: String,
  })
);

module.exports = Users;
