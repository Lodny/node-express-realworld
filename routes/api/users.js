const router = require('express').Router();
const User = require('mongoose').model('User');
const auth = require('../auth');

// update
router.put('/user', auth.required, async (req, res, next) => {
  // if (req.payload?.error) {
  //   console.log('error update : ', req.payload.error);
  //   return res.status(req.payload.error.status).send(req.payload.error.message);
  // }
  // console.log('req.payload : ', req.payload);

  User.findById(req.AUTH.id)
    .then((user) => {
      if (!user) {
        return res.sendStatus(401);
      }

      // only update fields that were actually passed...
      if (typeof req.body.user.username !== 'undefined') {
        user.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== 'undefined') {
        user.email = req.body.user.email;
      }
      if (typeof req.body.user.bio !== 'undefined') {
        user.bio = req.body.user.bio;
      }
      if (typeof req.body.user.image !== 'undefined') {
        user.image = req.body.user.image;
      }
      if (typeof req.body.user.password !== 'undefined') {
        user.setPassword(req.body.user.password);
      }

      return user.save().then(function () {
        return res.json({ user: user.toAuthJSON() });
      });
    })
    .catch(next);
});

// login
router.post('/users/login', async (req, res) => {
  const { email, password } = req.body.user;

  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "can't be blank" } });
  }

  if (!req.body.user.password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (user && user.validPassword(password)) {
        console.log('>>> login : user : ', user);
        return res.json({ user: user.toAuthJSON() });
      } else return res.status(422).json({ errors: { 'email or password': 'is invalid' } });
    })
    .catch((err) => res.status(422).json({ errors: { 'email or password': 'is invalid' } }));
});

// register
router.post('/users', (req, res, next) => {
  console.log('users.js : register : ', req.body);

  const user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.setPassword(req.body.user.password);

  user
    .save()
    .then(() => res.json({ user: user.toAuthJSON() }))
    .catch(next);
});

// app.get('/api/users', async (req, res) => {
//   const users = await Users.find({});
//   res.send(users);
// });

module.exports = router;
