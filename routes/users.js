const express = require('express');
const Users = require('../model/usersModel');
const jwt = require('../routes/token');

const router = express.Router();

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body.user;

  const errors = await checkLoginParam(Users, email, password);
  const errCount = errors['email or password'].length;
  if (errCount > 0) return res.status(422).send({ errors });

  //const check = await Users.updateOne({ email: email }, { token: jwt.get(email) });
  //console.log('updateOne check : ', check);

  const user = await Users.findOne({ email: email, password: password });
  console.log('> login : ', user);
  return res.send({ user });
});

// register
router.post('/', async (req, res) => {
  // console.log('add user : ', req.body.email, req.body.usernam, req.body.password);
  // console.log(req.body);

  const { username, email, password } = req.body.user;

  const errors = await checkRegisterParam(Users, username, email, password);
  const errCount = errors.username.length + errors.email.length + errors.password.length;
  if (errCount > 0) return res.status(422).send({ errors });

  let user = {
    // id: 151568,
    email: email,
    createdAt: new Date(),
    updatedAt: new Date(),
    username: username,
    password: password,
    bio: null,
    image: null,
    // token: jwt.get(email),
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTUxNTY4LCJ1c2VybmFtZSI6ImRyaW5ranVpY2U1IiwiZXhwIjoxNjIxNTE0MjQzfQ.ARav1u0LDSMgVk9LqB8oFtLDlNcRqF3mNRuI3Ub7EIk',
  };

  const newUser = await Users(user).save();
  console.log('> register : ', newUser);
  return res.send({ user });
});

// app.get('/api/users', async (req, res) => {
//   const users = await Users.find({});
//   res.send(users);
// });

// function --------------------------------------------------------
// -----------------------------------------------------------------
async function checkLoginParam(Users, email, password) {
  console.log('checkLoginParam() : ', email, password);

  const errors = { 'email or password': [] };

  if (!email || !password) {
    errors['email or password'].push('is invalid');
  } else {
    const ret = await Users.findOne({ email: email, password: password });
    if (!ret) {
      errors['email or password'].push('is invalid');
    }
  }

  console.log(errors);
  return errors;
}

async function checkRegisterParam(Users, username, email, password) {
  console.log('checkRegisterParam() : ', username, email, password);

  const errors = { username: [], email: [], password: [] };

  if (!username) errors.username.push("can't be blank");
  if (username.length < 1) {
    errors.username.push('is too short (minimum is 1 character)');
  } else if (username.length > 20) {
    errors.username.push('is too long (maximum is 20 characters)');
  } else {
    const ret = await Users.findOne({ username: username });
    if (ret) {
      // exist username
      errors.username.push('has already been taken');
    }
  }

  if (!email) {
    errors.email.push("can't be blank");
  } else {
    const ret = await Users.findOne({ email: email });
    if (ret) {
      // exist username
      errors.email.push('has already been taken');
    }
  }

  if (!password) errors.password.push("can't be blank");

  console.log(errors);
  return errors;
}

module.exports = router;
