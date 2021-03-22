const express = require('express');
//import Users from '../model/usersModel';
const Users = require('../model/usersModel');

const router = express.Router();

// update
router.put('/', async (req, res) => {
  const { image, username, bio, email, password } = req.body.user;

  console.log(req.body.user);
  console.log(req.headers.authorization);

  // const user = await Users.findOne({ username: '333' });
  const user = await Users.findOne({ token: req.headers.authorization.slice(6) });
  if (user) {
    console.log('update : user : ', user);
  }

  // const errors = await checkLoginParam(Users, email, password);
  // const errCount = errors['email or password'].length;
  // if (errCount > 0) return res.status(422).send({ errors });

  // const user = await Users.findOne({ email: email, password: password });
  // console.log('> login : ', user);
  // return res.send({ user });
  return res.send('good');
});

// {user: {email: "drinkjuice55@naver.com", bio: null, image: null, username: "drinkjuice55"}}
// {"user":{"id":151568,"email":"drinkjuice55@naver.com","createdAt":"2021-03-21T12:37:23.922Z","updatedAt":"2021-03-22T02:00:02.575Z","username":"drinkjuice55","bio":null,"image":null,"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6MTUxNTY4LCJ1c2VybmFtZSI6ImRyaW5ranVpY2U1NSIsImV4cCI6MTYyMTU2MjQwMn0.PQkRoDhqBVnm8XizgfFQteBAKWyCI5NMD6BGe7OJieE"}}

module.exports = router;
